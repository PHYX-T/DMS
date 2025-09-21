<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Codes Management</h2>
      <div class="flex items-center gap-2">
        <Button size="sm" variant="secondary" @click="exportCSV">Export CSV</Button>
        <label class="inline-flex items-center gap-2 text-sm">
          <input ref="file" type="file" accept="text/csv" class="hidden" @change="importCSV" />
          <Button size="sm" @click="file?.click()">Import CSV</Button>
        </label>
      </div>
    </div>

    <Tabs v-model="tab" :tabs="['Companies (AAA)','Subsidiaries (BB)','Departments (CCC)','Types (DDD)','Proposals','Audit']">
      <template #default="{ index }">
        <div v-if="index<4">
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
            <div class="flex items-center gap-2 mb-3">
              <Input v-model="draft.value" placeholder="Code ({{ lengths[index] }} chars)" class="w-40" />
              <Input v-model="draft.label" placeholder="Label" class="w-80" />
              <Button size="sm" :disabled="!canAdd" @click="propose">Propose</Button>
              <div class="text-xs" :class="error ? 'text-[var(--error)]' : 'text-[var(--content-muted)]'">{{ helper }}</div>
            </div>
            <div class="overflow-auto">
              <table class="min-w-full text-sm">
                <thead>
                  <tr class="text-left text-[var(--content-muted)] border-b border-[var(--border)]">
                    <th class="px-3 py-2">Value</th>
                    <th class="px-3 py-2">Label</th>
                    <th class="px-3 py-2">Usage</th>
                    <th class="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in currentList" :key="c.value" class="border-b border-[var(--border)]">
                    <td class="px-3 py-2 font-mono">{{ c.value }}</td>
                    <td class="px-3 py-2">{{ c.label }}</td>
                    <td class="px-3 py-2">{{ usageCount(c.value) }}</td>
                    <td class="px-3 py-2">
                      <Button size="sm" variant="secondary" @click="edit(c)">Edit</Button>
                      <Button size="sm" variant="secondary" @click="remove(c)">Delete</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else-if="index===4" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
            <h3 class="font-medium mb-3">Pending Proposals</h3>
            <div v-if="!hasProposals" class="text-sm text-[var(--content-muted)]">No proposals.</div>
            <div v-else class="overflow-auto">
              <table class="min-w-full text-sm">
                <thead>
                  <tr class="text-left text-[var(--content-muted)] border-b border-[var(--border)]">
                    <th class="px-3 py-2">Kind</th>
                    <th class="px-3 py-2">Value</th>
                    <th class="px-3 py-2">Label</th>
                    <th class="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in proposalRows" :key="p.kind+p.value" class="border-b border-[var(--border)]">
                    <td class="px-3 py-2">{{ p.kind }}</td>
                    <td class="px-3 py-2 font-mono">{{ p.value }}</td>
                    <td class="px-3 py-2">{{ p.label }}</td>
                    <td class="px-3 py-2">
                      <Button size="sm" @click="approve(p.kind, p.value)">Approve</Button>
                      <Button size="sm" variant="secondary" @click="reject(p.kind, p.value)">Reject</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
            <h3 class="font-medium mb-3">Guidelines</h3>
            <ul class="text-sm list-disc pl-5">
              <li>Dual-approval: Controller proposes, QMS approves.</li>
              <li>Prevent conflicts: values must be unique per kind.</li>
              <li>CSV: headers value,label. Length: AAA/CCC/DDD=3, BB=2.</li>
            </ul>
          </div>
        </div>
        <div v-else>
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
            <h3 class="font-medium mb-3">Audit Trail</h3>
            <ul class="text-sm divide-y divide-[var(--border)]">
              <li v-for="e in audit.items" :key="e.id" class="py-2">
                <span class="text-xs text-[var(--content-muted)]">{{ e.timestamp }}</span>
                <span class="mx-2">—</span>
                <span class="font-medium">{{ e.action }}</span>
                <span class="mx-2">by {{ e.actor }}</span>
                <span class="ml-2 text-xs text-[var(--content-muted)]">{{ e.details.kind }} {{ e.details.value }}</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </Tabs>

    <!-- Edit Modal -->
    <Modal :open="editOpen" title="Edit code" @close="editOpen=false">
      <div class="space-y-3">
        <Input v-model="editor.value" label="Value" />
        <Input v-model="editor.label" label="Label" />
      </div>
      <template #footer>
        <Button variant="secondary" @click="editOpen=false">Cancel</Button>
        <Button :disabled="!editor.value || !editor.label" @click="saveEdit">Save</Button>
      </template>
    </Modal>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Tabs from '@/components/ui/Tabs.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import { useCodesStore, type CodeOption } from '@/stores/codes'
import { useSystemAuditStore } from '@/stores/system_audit'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const codes = useCodesStore()
const audit = useSystemAuditStore()

const file = ref<HTMLInputElement | null>(null)
const tab = ref(0)
const lengths = [3,2,3,3]

const currentKind = computed(() => ['companies','subsidiaries','departments','types'][tab.value] as 'companies'|'subsidiaries'|'departments'|'types')
const currentList = computed(() => (codes as any)[currentKind.value] as CodeOption[])
const proposalRows = computed(() => {
  const out: Array<{ kind: string; value: string; label: string }> = []
  for (const k of ['companies','subsidiaries','departments','types'] as const) {
    for (const p of (codes.proposals as any)[k] as CodeOption[]) out.push({ kind: k, value: p.value, label: p.label })
  }
  return out
})
const hasProposals = computed(() => proposalRows.value.length > 0)

const draft = reactive<{ value: string; label: string }>({ value: '', label: '' })
const error = ref('')
const helper = computed(() => error.value || (auth.role==='QMS' ? 'QMS can approve proposals' : 'Controller proposes; QMS approves'))
const canAdd = computed(() => {
  if (auth.role !== 'DocumentController' && auth.role !== 'Admin') return false
  const len = lengths[tab.value]
  if (draft.value.length !== len) { error.value = `Value must be ${len} characters`; return false }
  const exists = currentList.value.some(c => c.value === draft.value) || (codes.proposals as any)[currentKind.value].some((c: CodeOption) => c.value === draft.value)
  if (exists) { error.value = 'Value already exists'; return false }
  if (!draft.label.trim()) { error.value = 'Label required'; return false }
  error.value = ''
  return true
})

function propose() {
  codes.propose(currentKind.value, { value: draft.value.toUpperCase(), label: draft.label })
  audit.log('codes','proposed', auth.user?.id || 'me', { kind: currentKind.value, value: draft.value })
  draft.value = ''; draft.label = ''
}
function approve(kind: any, value: string) {
  if (auth.role !== 'QMS' && auth.role !== 'Admin') return
  codes.approve(kind, value)
  audit.log('codes','approved', auth.user?.id || 'me', { kind, value })
}
function reject(kind: any, value: string) {
  if (auth.role !== 'QMS' && auth.role !== 'Admin') return
  codes.reject(kind, value)
  audit.log('codes','rejected', auth.user?.id || 'me', { kind, value })
}
function edit(c: CodeOption) { editor.kind = currentKind.value; editor.value = c.value; editor.label = c.label; editOpen.value = true }
function remove(c: CodeOption) { if (confirm('Delete code?')) { codes.remove(currentKind.value, c.value); audit.log('codes','deleted', auth.user?.id || 'me', { kind: currentKind.value, value: c.value }) } }
function saveEdit() { codes.upsert(editor.kind, { value: editor.value, label: editor.label }); audit.log('codes','updated', auth.user?.id || 'me', { kind: editor.kind, value: editor.value }); editOpen.value = false }

const editor = reactive<{ kind: 'companies'|'subsidiaries'|'departments'|'types'; value: string; label: string }>({ kind: 'companies', value: '', label: '' })
const editOpen = ref(false)

function exportCSV() {
  const csv = codes.exportCSV(currentKind.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${currentKind.value}.csv`; a.click(); URL.revokeObjectURL(url)
  audit.log('codes','exported', auth.user?.id || 'me', { kind: currentKind.value, count: (codes as any)[currentKind.value].length })
}
function importCSV(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const txt = String(reader.result || '')
    const res = codes.importCSV(currentKind.value, txt)
    if (!res.ok) alert('Import errors:\n' + res.errors.join('\n'))
    else audit.log('codes','imported', auth.user?.id || 'me', { kind: currentKind.value })
    input.value = ''
  }
  reader.readAsText(file)
}

function usageCount(v: string) { return codes.usageCount(v) }
</script>
