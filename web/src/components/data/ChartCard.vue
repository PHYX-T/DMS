<template>
  <div class="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
    <div class="text-sm text-[var(--content-muted)] mb-2">{{ title }}</div>
    <div class="h-40 flex items-center justify-center bg-[var(--muted)] rounded"> 
      <slot>Chart area</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

