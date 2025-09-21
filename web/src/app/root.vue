<template>
  <AppShell>
    <div v-if="!system.online" class="bg-[var(--warn)]/10 text-[var(--warn)] text-center text-sm py-2">You're offline. Some actions will be queued and retried.</div>
    <ToastContainer />
    <CookieBanner />
    <Modal :open="auth.idleWarning" title="You are about to be signed out" @close="auth.idleWarning=false">
      <p class="text-sm">Due to inactivity, your session will end soon.</p>
      <p v-if="deadlineSeconds > 0" class="text-sm mt-2">Time remaining: {{ deadlineSeconds }}s</p>
      <template #footer>
        <Button @click="auth.recordActivity()">Stay signed in</Button>
      </template>
    </Modal>
    <RouterView />
  </AppShell>
  
</template>

<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import CookieBanner from '@/components/ui/CookieBanner.vue'
import { computed } from 'vue'
const auth = useAuthStore()
const system = useSystemStore()
const deadlineSeconds = computed(() => auth.warningDeadlineAt ? Math.max(0, Math.ceil((auth.warningDeadlineAt - Date.now()) / 1000)) : 0)
</script>
