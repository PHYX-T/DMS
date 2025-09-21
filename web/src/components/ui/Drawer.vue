<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-40" @keydown.esc.prevent.stop="emit('close')">
      <div class="absolute inset-0 bg-black/40" aria-hidden="true" @click="emit('close')"></div>
      <div class="absolute inset-x-0 bottom-0 p-2">
        <div class="mx-auto w-full max-w-2xl rounded-t-2xl bg-[var(--surface)] text-[var(--content)] shadow-card" role="dialog" aria-modal="true" :aria-label="label">
          <header class="px-4 py-3 border-b border-[var(--border)] font-semibold">{{ title }}</header>
          <section class="p-4 max-h-[70vh] overflow-auto"><slot /></section>
          <footer class="px-4 py-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
            <slot name="actions" />
          </footer>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; title: string; label?: string }>()
const emit = defineEmits<{ (e:'close'): void }>()
</script>

