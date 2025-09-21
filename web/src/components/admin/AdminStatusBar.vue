<template>
  <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 flex items-center gap-6 text-sm">
    <div>Indexing Queue: <span :class="idxWarn ? 'text-[var(--warn)]' : 'text-[var(--content)]'">{{ indexingQueue }}</span></div>
    <div>Storage: <span :class="storeWarn ? 'text-[var(--warn)]' : 'text-[var(--content)]'">{{ storagePct }}%</span></div>
    <div class="ml-auto" :class="ssoConfigured ? 'text-[var(--ok)]' : 'text-[var(--warn)]'">SSO: {{ ssoConfigured ? 'configured' : 'not configured' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '@/stores/system'

const system = useSystemStore()
const { indexingQueue, storagePct, ssoConfigured } = storeToRefs(system as any)
const idxWarn = computed(() => (indexingQueue.value || 0) > 100)
const storeWarn = computed(() => (storagePct.value || 0) > 80)
</script>

