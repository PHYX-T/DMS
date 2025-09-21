<template>
  <section class="container-app py-6 space-y-4">
    <div class="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
      <h2 class="text-xl font-semibold mb-2">System Status</h2>
      <p class="text-sm" :class="incident ? 'text-[var(--warn)]' : 'text-[var(--content-muted)]'">{{ incident ? incidentMessage : 'All systems operational.' }}</p>
      <p v-if="incident" class="text-sm mt-2">Service is operating in read-only mode. Contact IT for urgent actions.</p>
      <div class="mt-3 flex items-center gap-2">
        <RouterLink to="/help" class="text-sm hocus:text-[var(--accent)]">Contact Support</RouterLink>
        <Button size="sm" variant="secondary" @click="report">Report an issue</Button>
      </div>
    </div>

    <div class="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
      <h3 class="font-medium mb-2">Degraded Modes</h3>
      <ul class="text-sm list-disc pl-5">
        <li>Search: read-only during incidents</li>
        <li>Publishing: queued until service resumes</li>
      </ul>
    </div>

    <div class="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
      <h3 class="font-medium mb-2">Disaster Recovery</h3>
      <p class="text-sm">RTO 4h / RPO 1h — current snapshot: {{ snapshot }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import { useSystemStore } from '@/stores/system'
const system = useSystemStore()
const incident = computed(() => (system as any).incident)
const incidentMessage = computed(() => (system as any).incidentMessage || 'Service degradation detected')
const snapshot = computed(() => new Date().toLocaleString())
function report() { window.location.href = 'mailto:support@example.com?subject=Incident%20Report' }
</script>
