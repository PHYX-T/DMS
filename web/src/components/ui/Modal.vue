<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-40" @keydown.esc.prevent.stop="emit('close')">
      <div class="absolute inset-0 bg-black/40" aria-hidden="true" @click="emit('close')"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div ref="dialog" class="w-full max-w-lg rounded-lg bg-[var(--surface)] text-[var(--content)] shadow-card" role="dialog" aria-modal="true" :aria-label="label">
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
import { onMounted, ref, watch } from 'vue'
const props = defineProps<{ open: boolean; title: string; label?: string }>()
const emit = defineEmits<{ (e:'close'): void }>()
const dialog = ref<HTMLDivElement | null>(null)

onMounted(() => {
  watch(() => props.open, (v) => {
    if (v && dialog.value) dialog.value.focus()
  }, { immediate: true })
})
</script>

