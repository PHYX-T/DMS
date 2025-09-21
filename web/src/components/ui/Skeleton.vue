<template>
  <div class="animate-pulse rounded" :class="shapeClass" :style="{ width, height }" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ width?: string; height?: string; circle?: boolean }>(), { width: '100%', height: '1rem', circle: false })
const shapeClass = computed(() => props.circle ? 'rounded-full bg-[var(--muted)]' : 'bg-[var(--muted)]')
</script>

