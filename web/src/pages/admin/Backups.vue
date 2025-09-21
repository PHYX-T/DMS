<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Backups</h2>
      <div class="text-sm text-[var(--content-muted)]">Targets: RTO 4h · RPO 1h</div>
    </div>

    <AdminStatusBar />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Snapshots</h3>
        <div class="text-sm">Last Snapshot: <strong>{{ lastSnapshot }}</strong></div>
        <div class="mt-3 flex items-center gap-2">
          <Button @click="snapshot">Manual Snapshot</Button>
          <Button variant="secondary" @click="simulateRestore">Restore Simulation</Button>
        </div>
      </div>
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Notes</h3>
        <p class="text-sm">Backups are performed server‑side. This UI provides visibility and allows on‑demand snapshots and non‑destructive restores for testing.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import AdminStatusBar from '@/components/admin/AdminStatusBar.vue'
import { useNotificationsStore } from '@/stores/notifications'

const toasts = useNotificationsStore()
const lastSnapshot = ref('2025-09-10 03:00 UTC')
function snapshot() { lastSnapshot.value = new Date().toUTCString(); toasts.push('Snapshot triggered (mock)', 'info') }
function simulateRestore() { toasts.push('Restore simulation completed (UI only)', 'info') }
</script>
