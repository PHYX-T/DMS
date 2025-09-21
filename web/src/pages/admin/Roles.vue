<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Roles & Permissions</h2>
      <Button size="sm" @click="save">Save Policy Snapshot</Button>
    </div>

    <AdminStatusBar />

    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr>
            <th class="px-3 py-2 text-left">Resource.Action</th>
            <th v-for="r in roles" :key="r" class="px-3 py-2">{{ r }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="perm in perms" :key="perm.key" class="border-t border-[var(--border)]">
            <td class="px-3 py-2 font-mono">{{ perm.key }}</td>
            <td v-for="r in roles" :key="r" class="px-3 py-2 text-center">
              <input type="checkbox" v-model="matrix[perm.key]" :value="r" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import Button from '@/components/ui/Button.vue'
import AdminStatusBar from '@/components/admin/AdminStatusBar.vue'
import { useSystemAuditStore } from '@/stores/system_audit'
import { useAuthStore } from '@/stores/auth'

const audit = useSystemAuditStore(); const auth = useAuthStore()
const roles = ['EndUser','DocumentOwner','DocumentController','QMS','Admin','ExternalAuditor']
const perms = [
  { key: 'document.publish' },
  { key: 'document.archive' },
  { key: 'document.restore' },
  { key: 'codes.propose' },
  { key: 'codes.approve' },
  { key: 'audit.view' },
]
const matrix = reactive<Record<string, string[]>>({
  'document.publish': ['DocumentController','Admin'],
  'document.archive': ['DocumentController','Admin'],
  'document.restore': ['DocumentController','Admin'],
  'codes.propose': ['DocumentController','Admin'],
  'codes.approve': ['QMS','Admin'],
  'audit.view': ['Admin','QMS'],
})

function save() {
  audit.log('codes','updated', auth.user?.id || 'me', { kind: 'policy', value: JSON.stringify(matrix) })
}
</script>
