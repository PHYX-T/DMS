<template>
  <span class="relative inline-block" @mouseenter="show=true" @mouseleave="show=false" @focusin="show=true" @focusout="show=false">
    <slot />
    <span v-if="show" role="tooltip" class="absolute z-20 -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-[var(--content)] text-white text-xs px-2 py-1 rounded shadow-card whitespace-nowrap">
      {{ text }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ text: string }>()
const show = ref(false)
</script>

