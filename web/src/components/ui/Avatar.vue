<template>
  <div class="inline-flex items-center justify-center rounded-full bg-[var(--muted)] text-[var(--content)] border border-[var(--border)] overflow-hidden" :style="{ width: size+'px', height: size+'px' }" :aria-label="alt">
    <img v-if="src" :src="src" :alt="alt" class="w-full h-full object-cover" loading="lazy" />
    <span v-else class="font-medium" :style="{ fontSize: Math.round(size/2.5)+'px' }">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ src?: string; alt?: string; name?: string; size?: number }>(), { size: 40, alt: 'avatar' })
const initials = computed(() => (props.name || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase())
</script>

