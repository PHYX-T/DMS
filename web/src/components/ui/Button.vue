<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium focus:outline-none transition-colors"
    :class="classes"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ variant?: 'primary'|'secondary'|'ghost'|'danger'|'link'; size?: 'sm'|'md'|'lg'; type?: 'button'|'submit'|'reset'; loading?: boolean; disabled?: boolean; block?: boolean }>(), { variant: 'primary', size: 'md', type: 'button', loading: false, disabled: false, block: false })

const classes = computed(() => [
  props.block ? 'w-full' : 'w-auto',
  props.size === 'sm' ? 'px-3 py-2 text-sm' : props.size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm',
  props.variant === 'primary' && 'bg-[var(--accent)] text-white hocus:bg-[var(--accent-600)]',
  props.variant === 'secondary' && 'bg-[var(--muted)] text-[var(--content)] hocus:bg-[var(--border)]',
  props.variant === 'ghost' && 'bg-transparent text-[var(--content)] hocus:bg-[color-mix(in_hsl,var(--muted),transparent 60%)]',
  props.variant === 'danger' && 'bg-[var(--error)] text-white hocus:opacity-90',
  props.variant === 'link' && 'bg-transparent text-[var(--accent)] underline underline-offset-2 px-0 py-0',
  (props.disabled || props.loading) && 'opacity-60 cursor-not-allowed',
])
</script>

