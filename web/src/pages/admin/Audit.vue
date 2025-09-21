<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Audit</h2>
      <div class="flex items-center gap-2">
        <Input v-model="query" placeholder="Filter by action, user, doc…" />
        <Button @click="exportCSV">Export CSV</Button>
      </div>
    </div>

    <AdminStatusBar />

    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <div class="text-xs text-[var(--content-muted)]">WORM: Immutable by design</div>
    </div>

    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left text-[var(--content-muted)] border-b border-[var(--border)]">
            <th class="px-3 py-2">Time</th>
            <th class="px-3 py-2">Action</th>
            <th class="px-3 py-2">User</th>
            <th class="px-3 py-2">Document</th>
            <th class="px-3 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtered" :key="e.id" class="border-b border-[var(--border)]">
            <td class="px-3 py-2 text-xs">{{ e.timestamp }}</td>
            <td class="px-3 py-2">{{ e.action }}</td>
            <td class="px-3 py-2 text-xs">{{ e.userId || e.actor }}</td>
            <td class="px-3 py-2 text-xs">{{ e.documentId || e.details?.documentId || '—' }}</td>
            <td class="px-3 py-2 text-xs truncate max-w-[360px]">{{ e.details && JSON.stringify(e.details) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import AdminStatusBar from '@/components/admin/AdminStatusBar.vue'
import { useAuditStore } from '@/stores/audit'
import { useSystemAuditStore } from '@/stores/system_audit'

const docAudit = useAuditStore(); const sysAudit = useSystemAuditStore()
const query = ref('')
const merged = computed(() => {
  const a = docAudit.items.map(e => ({ ...e, actor: e.userId, details: e.details || {} }))
  const b = sysAudit.items.map(e => ({ id: e.id, timestamp: e.timestamp, action: e.action, userId: e.actor, documentId: (e.details as any)?.documentId, details: e.details }))
  return [...a, ...b].sort((x,y) => (y.timestamp as any).localeCompare(x.timestamp as any))
})
const filtered = computed(() => merged.value.filter(e => {
  const s = (query.value || '').toLowerCase()
  const blob = [e.action, e.userId, e.documentId, JSON.stringify(e.details||{})].join(' ').toLowerCase()
  return !s || blob.includes(s)
}))

function exportCSV() {
  const rows = [['timestamp','action','user','document','details'], ...filtered.value.map(e => [e.timestamp, e.action, e.userId || '', e.documentId || '', JSON.stringify(e.details||{})])]
  const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'audit.csv'; a.click(); URL.revokeObjectURL(url)
}
</script>
