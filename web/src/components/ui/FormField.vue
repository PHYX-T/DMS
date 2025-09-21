<template>
  <div class="w-full">
    <div class="flex items-start justify-between">
      <label :for="id" class="block text-sm font-medium text-[var(--content)]">{{ label }}</label>
      <slot name="help" />
    </div>
    <div class="mt-1">
      <slot />
    </div>
    <p v-if="hint && !error" class="mt-1 text-xs text-[var(--content-muted)]">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-[var(--error)]">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id?: string; label: string; hint?: string; error?: string }>()
</script>

