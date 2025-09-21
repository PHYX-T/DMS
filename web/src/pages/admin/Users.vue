<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Users</h2>
      <div class="flex items-center gap-2">
        <Input v-model="inviteEmail" placeholder="email@example.com" />
        <Button @click="invite">Invite</Button>
      </div>
    </div>

    <AdminStatusBar />

    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left text-[var(--content-muted)] border-b border-[var(--border)]">
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Email</th>
            <th class="px-3 py-2">Role</th>
            <th class="px-3 py-2">Last Login</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2">Delegation</th>
            <th class="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users.items" :key="u.id" class="border-b border-[var(--border)]">
            <td class="px-3 py-2">{{ u.name }}</td>
            <td class="px-3 py-2">{{ u.email }}</td>
            <td class="px-3 py-2">
              <select v-model="u.role" class="rounded border border-[var(--border)] p-1">
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
              </select>
            </td>
            <td class="px-3 py-2 text-xs text-[var(--content-muted)]">{{ u.lastLogin || '—' }}</td>
            <td class="px-3 py-2">
              <Badge :kind="u.status==='active' ? 'ok' : 'warn'">{{ u.status }}</Badge>
            </td>
            <td class="px-3 py-2 text-xs">
              <div v-if="u.delegation">{{ u.delegation.role }} until {{ fmt(u.delegation.expiresAt) }}</div>
              <div v-else class="text-[var(--content-muted)]">None</div>
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <Button size="sm" variant="secondary" @click="reset(u.id)">Reset Password</Button>
                <Button size="sm" variant="secondary" @click="toggleStatus(u)">{{ u.status==='active' ? 'Deactivate' : 'Reactivate' }}</Button>
                <Button size="sm" @click="openDelegation(u)">Delegate</Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :open="dlgOpen" title="Assign Delegation" @close="dlgOpen=false">
      <div class="space-y-3">
        <div><label class="text-sm font-medium">Role</label>
          <select v-model="dlg.role" class="mt-1 w-full rounded border border-[var(--border)] p-2.5">
            <option value="DocumentOwner">DocumentOwner</option>
            <option value="DocumentController">DocumentController</option>
          </select>
        </div>
        <div><label class="text-sm font-medium">Expiry</label>
          <input v-model="dlg.expiresAt" type="datetime-local" class="mt-1 w-full rounded border border-[var(--border)] p-2.5" />
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="dlgOpen=false">Cancel</Button>
        <Button :disabled="!dlg.expiresAt" @click="saveDelegation">Save</Button>
      </template>
    </Modal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import AdminStatusBar from '@/components/admin/AdminStatusBar.vue'
import { useUsersStore } from '@/stores/users'
import type { AdminUser } from '@/stores/users'

const users = useUsersStore()
const roles = ['EndUser','DocumentOwner','DocumentController','QMS','Admin','ExternalAuditor']
const inviteEmail = ref('')
function invite() { if (inviteEmail.value) { users.invite(inviteEmail.value); inviteEmail.value = '' } }
function reset(id: string) { users.resetPassword(id) }
function toggleStatus(u: AdminUser) { users.setStatus(u.id, u.status==='active' ? 'inactive' : 'active') }
function fmt(ts: number) { return new Date(ts).toLocaleString() }

const dlgOpen = ref(false)
const dlg = ref<{ id?: string; role: 'DocumentOwner'|'DocumentController'; expiresAt: string }>({ role: 'DocumentOwner', expiresAt: '' })
function openDelegation(u: AdminUser) { dlg.value = { id: u.id, role: 'DocumentOwner', expiresAt: '' }; dlgOpen.value = true }
function saveDelegation() {
  const ts = Date.parse(dlg.value.expiresAt)
  if (Number.isNaN(ts) || !dlg.value.id) return
  users.setDelegation(dlg.value.id, { role: dlg.value.role, expiresAt: ts })
  dlgOpen.value = false
}
</script>
