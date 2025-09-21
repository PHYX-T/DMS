<template>
  <button :type="type" class="inline-flex items-center justify-center rounded-full p-2 focus:outline-none hocus:bg-[var(--muted)]" :aria-label="ariaLabel" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ type?: 'button'|'submit'|'reset'; ariaLabel: string }>()
</script>

