<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium">{{ label }}</label>
    <textarea :id="id" v-model="model" :rows="rows" class="mt-1 w-full rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] p-3 dense-input transition-colors"></textarea>
    <p v-if="hint && !error" class="mt-1 text-xs text-[var(--content-muted)]">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-[var(--error)]">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ id?: string; label?: string; modelValue?: string; rows?: number; hint?: string; error?: string }>(), { rows: 4 })
const emit = defineEmits<{ (e:'update:modelValue', v: string): void }>()
const model = computed({ get: () => props.modelValue ?? '', set: (v: string) => emit('update:modelValue', v) })
</script>
