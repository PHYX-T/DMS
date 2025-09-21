<template>
  <div v-if="show" class="fixed inset-x-0 bottom-0 z-50">
    <div class="m-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-card text-sm">
      <div class="flex items-start gap-3">
        <div class="flex-1">
          We use local storage and optional telemetry to improve the app. You can change this anytime in Settings.
        </div>
        <div class="flex items-center gap-2">
          <Button size="sm" variant="secondary" @click="decline">Decline</Button>
          <Button size="sm" @click="accept">Accept</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import { useTelemetryStore } from '@/stores/telemetry'
const telemetry = useTelemetryStore()
const show = computed(() => !telemetry.decided)
function accept() { telemetry.grant() }
function decline() { telemetry.deny() }
</script>
