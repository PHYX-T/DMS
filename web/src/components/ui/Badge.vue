<template>
  <span :class="['inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', kindClass]">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ kind?: 'ok'|'warn'|'error'|'info' }>(), { kind: 'info' })
const kindClass = computed(() => ({
  ok: 'bg-[color-mix(in_oklab,var(--ok),white 80%)] text-[var(--ok)]',
  warn: 'bg-[color-mix(in_oklab,var(--warn),white 80%)] text-[var(--warn)]',
  error: 'bg-[color-mix(in_oklab,var(--error),white 80%)] text-[var(--error)]',
  info: 'bg-[color-mix(in_oklab,var(--info),white 80%)] text-[var(--info)]',
} as any)[props.kind])
</script>

