<template>
  <div class="w-full bg-[var(--muted)] rounded-full overflow-hidden" role="progressbar" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="value">
    <div class="h-2 bg-[var(--accent)] transition-all" :style="{ width: Math.max(0,Math.min(100,value)) + '%' }"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ value: number }>()
</script>

