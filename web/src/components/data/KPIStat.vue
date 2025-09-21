<template>
  <div class="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
    <div class="text-sm text-[var(--content-muted)]">{{ label }}</div>
    <div class="mt-1 text-2xl font-semibold">{{ value }}</div>
    <div v-if="delta" class="mt-1 text-xs" :class="delta.startsWith('+') ? 'text-[var(--ok)]' : 'text-[var(--error)]'">{{ delta }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number; delta?: string }>()
</script>

