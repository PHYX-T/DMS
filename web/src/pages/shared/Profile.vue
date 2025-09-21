<template>
  <section class="space-y-6">
    <h2 class="text-xl font-semibold">Profile</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
        <h3 class="font-medium">Account</h3>
        <div class="text-sm">
          <div><span class="text-[var(--content-muted)]">Name:</span> {{ auth.user?.name }}</div>
          <div><span class="text-[var(--content-muted)]">Email:</span> {{ auth.user?.email }}</div>
          <div><span class="text-[var(--content-muted)]">Role:</span> {{ roleLabel }}</div>
        </div>
        <div v-if="auth.delegation" class="text-xs text-[var(--content-muted)]">Delegation expires: {{ formatTs(auth.delegation.expiresAt) }}</div>
        <div>
          <Button variant="secondary" @click="auth.signOut()">Sign out</Button>
        </div>
      </div>

      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
        <h3 class="font-medium">Security</h3>
        <div class="text-sm flex items-center gap-2">
          <input id="twofa" type="checkbox" v-model="twofa" />
          <label for="twofa">Enable Two-Factor (stub)</label>
        </div>
        <p class="text-xs text-[var(--content-muted)]">Two-factor is a placeholder; integrate with your provider.</p>
      </div>

      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
        <h3 class="font-medium">Session</h3>
        <div class="text-sm">
          <div><span class="text-[var(--content-muted)]">Last activity:</span> {{ formatTs(auth.lastActivityAt || Date.now()) }}</div>
          <div><span class="text-[var(--content-muted)]">Expires:</span> {{ formatTs(auth.sessionExpiresAt || Date.now()) }}</div>
        </div>
      </div>

      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3 md:col-span-2">
        <h3 class="font-medium">Devices (read-only)</h3>
        <ul class="text-sm list-disc pl-5">
          <li v-for="d in devices" :key="d.id"><span class="font-mono">{{ d.id }}</span> – {{ d.ua }} <span class="text-xs text-[var(--content-muted)]">(last seen {{ formatTs(d.lastSeen) }})</span></li>
        </ul>
      </div>
    </div>

    <Modal :open="auth.idleWarning" title="You are about to be signed out" @close="dismissIdle">
      <p class="text-sm">Due to inactivity, your session will end soon.</p>
      <p v-if="deadlineSeconds > 0" class="text-sm mt-2">Time remaining: {{ deadlineSeconds }}s</p>
      <template #footer>
        <Button @click="staySignedIn">Stay signed in</Button>
      </template>
    </Modal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import { useAuthStore } from '@/stores/auth'
import { displayRole } from '@/utils/rbac'

const auth = useAuthStore()
const twofa = ref(false)
const devices = computed(() => auth.listDevices())
const roleLabel = computed(() => displayRole(auth.role, auth.effectiveRole))
const deadlineSeconds = computed(() => auth.warningDeadlineAt ? Math.max(0, Math.ceil((auth.warningDeadlineAt - Date.now()) / 1000)) : 0)

function formatTs(ts: number) {
  const d = new Date(ts); return d.toLocaleString()
}
function staySignedIn() { auth.recordActivity() }
function dismissIdle() { auth.idleWarning = false }

onMounted(() => { /* could fetch devices from backend in real impl */ })
</script>
