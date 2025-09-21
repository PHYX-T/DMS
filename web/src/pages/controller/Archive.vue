<template>
  <section class="space-y-6">
    <h2 class="text-xl font-semibold">Archive & Restore</h2>

    <!-- Bulk Archive: candidates with newer approved version -->
    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="font-medium">Archive Candidates</h3>
          <p class="text-xs text-[var(--content-muted)]">These versions have a newer approved version and are safe to archive.</p>
        </div>
        <div class="flex items-center gap-2">
          <Button size="sm" variant="secondary" @click="toggleAll">{{ allSelected ? 'Unselect All' : 'Select All' }}</Button>
          <Button size="sm" :disabled="!selected.size" @click="archiveSelected">Archive Selected</Button>
        </div>
      </div>
      <div v-if="!candidates.length" class="text-sm text-[var(--content-muted)]">No candidates.</div>
      <div v-else class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-[var(--content-muted)] border-b border-[var(--border)]">
              <th class="px-3 py-2"><input type="checkbox" :checked="allSelected" @change="toggleAll" aria-label="Select all" /></th>
              <th class="px-3 py-2">Title</th>
              <th class="px-3 py-2">ID</th>
              <th class="px-3 py-2">Version</th>
              <th class="px-3 py-2">Newer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in candidates" :key="it.id+it.version" class="border-b border-[var(--border)]">
              <td class="px-3 py-2"><input type="checkbox" :checked="selected.has(keyOf(it))" @change="toggle(it)" :aria-label="`Select ${it.id}`" /></td>
              <td class="px-3 py-2 truncate max-w-[360px]">{{ it.title }}</td>
              <td class="px-3 py-2 font-mono text-xs">{{ it.id }}</td>
              <td class="px-3 py-2">{{ it.version }}</td>
              <td class="px-3 py-2"><Badge kind="info">{{ it.newerVersion }}</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Archived list with Restore and retention info -->
    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="font-medium">Archived</h3>
          <p class="text-xs text-[var(--content-muted)]">Disposal is automated server‑side; countdown and policy are read‑only.</p>
        </div>
      </div>
      <div v-if="!archived.length" class="text-sm text-[var(--content-muted)]">No archived versions.</div>
      <ul v-else class="divide-y divide-[var(--border)]">
        <li v-for="a in archived" :key="a.id+a.version" class="py-3 flex items-start gap-4">
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ a.title }}</div>
            <div class="text-xs text-[var(--content-muted)] font-mono">{{ a.id }} · v{{ a.version }}</div>
            <div class="text-xs mt-1">
              <span class="mr-3">Policy: <strong>{{ a.retention.policy }}</strong></span>
              <span class="mr-3">Months: {{ a.retention.durationMonths }}</span>
              <span>Disposal in: <strong>{{ disposalLabel(a) }}</strong></span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button size="sm" variant="secondary" @click="openRestore(a)">Restore</Button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Restore Modal -->
    <Modal :open="restoreOpen" title="Restore archived document" @close="restoreOpen=false">
      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium">Approver</label>
          <select v-model="restore.approver" class="mt-1 w-full rounded border border-[var(--border)] p-2.5">
            <option value="Controller">Controller</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div>
          <Textarea v-model="restore.reason" label="Reason" rows="3" placeholder="Provide a reason for restore" />
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="restoreOpen=false">Cancel</Button>
        <Button :disabled="!restore.reason" @click="confirmRestore">Restore</Button>
      </template>
    </Modal>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Modal from '@/components/ui/Modal.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useWorkflowStore } from '@/stores/workflow'

type Candidate = { id: string; title: string; version: string; newerVersion: string }
type Archived = { id: string; title: string; version: string; retention: { policy: 'WORM'|'STANDARD'; durationMonths: number; startDate: string } }

const toasts = useNotificationsStore()
const wf = useWorkflowStore()

// Mock data
const candidates = ref<Candidate[]>([
  { id: 'ABC-XY-ENG-PRO-001', title: 'Quality Policy', version: '3.1', newerVersion: '3.2' },
  { id: 'QMS-ZZ-QA-POL-010', title: 'Safety Policy', version: '1.3', newerVersion: '1.4' },
])
const archived = ref<Archived[]>([
  { id: 'ABC-XY-ENG-PRO-001', title: 'Quality Policy', version: '2.0', retention: { policy: 'STANDARD', durationMonths: 24, startDate: '2024-01-01' } },
])

const selected = ref(new Set<string>())
const keyOf = (it: Candidate) => `${it.id}@${it.version}`
const allSelected = computed(() => candidates.value.length > 0 && selected.value.size === candidates.value.length)
function toggle(it: Candidate) { const k = keyOf(it); selected.value.has(k) ? selected.value.delete(k) : selected.value.add(k) }
function toggleAll() { if (allSelected.value) selected.value.clear(); else candidates.value.forEach(it => selected.value.add(keyOf(it))) }

function archiveSelected() {
  const items = candidates.value.filter(it => selected.value.has(keyOf(it)))
  if (!items.length) return
  // Move to archived and append audit
  for (const it of items) {
    archived.value.push({ id: it.id, title: it.title, version: it.version, retention: { policy: 'STANDARD', durationMonths: 24, startDate: new Date().toISOString().slice(0,10) } })
    wf.appendAudit(it.id as any, 'Archived', 'controller', { fromVersion: it.version, supersededBy: it.newerVersion })
  }
  candidates.value = candidates.value.filter(it => !selected.value.has(keyOf(it)))
  selected.value.clear()
  toasts.push(`Archived ${items.length} item(s)`, 'info')
}

// Restore
const restoreOpen = ref(false)
const restore = reactive<{ id?: string; version?: string; reason: string; approver: 'Controller'|'Admin' }>({ reason: '', approver: 'Controller' })
function openRestore(a: Archived) { restore.id = a.id; restore.version = a.version; restore.reason = ''; restore.approver = 'Controller'; restoreOpen.value = true }
function confirmRestore() {
  if (!restore.id || !restore.version) return
  wf.appendAudit(restore.id as any, 'Restored', restore.approver.toLowerCase(), { version: restore.version, reason: restore.reason })
  archived.value = archived.value.filter(x => !(x.id === restore.id && x.version === restore.version))
  restoreOpen.value = false
  toasts.push('Restored', 'info')
}

function disposalLabel(a: Archived) {
  const start = new Date(a.retention.startDate)
  const end = new Date(start); end.setMonth(end.getMonth() + a.retention.durationMonths)
  const ms = end.getTime() - Date.now()
  if (ms <= 0) return 'Pending disposal'
  const days = Math.ceil(ms / (24*60*60*1000))
  return `${days} days`
}
</script>

