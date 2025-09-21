<template>
  <div class="fixed inset-x-0 top-0 z-50 p-4 flex flex-col items-center gap-2">
    <div v-for="n in items" :key="n.id" class="w-full max-w-md rounded-lg shadow-card px-4 py-3 text-sm"
         :class="n.level==='error' ? 'bg-[color-mix(in_oklab,var(--error),white 90%)] text-[var(--error)]' : n.level==='warn' ? 'bg-[color-mix(in_oklab,var(--warn),white 90%)] text-[var(--warn)]' : 'bg-[var(--surface)] text-[var(--content)] border border-[var(--border)]'">
      <div class="flex items-start gap-3">
        <div class="flex-1">{{ n.text }}</div>
        <button class="text-[var(--content-muted)] hocus:text-[var(--content)]" aria-label="Dismiss" @click="remove(n.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'
const store = useNotificationsStore()
const { items } = storeToRefs(store)
const remove = (id: string) => store.remove(id)
</script>

