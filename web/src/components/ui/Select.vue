<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium">{{ label }}</label>
    <select :id="id" v-model="model" class="mt-1 w-full rounded-lg border border-[var(--border)] bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] p-2.5 dense-input transition-colors">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="hint" class="mt-1 text-xs text-[var(--content-muted)]">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Option { value: string | number; label: string }
const props = defineProps<{ id?: string; label?: string; modelValue?: string | number; options: Option[]; hint?: string }>()
const emit = defineEmits<{ (e:'update:modelValue', v: string | number): void }>()
const model = computed({ get: () => props.modelValue as any, set: (v:any) => emit('update:modelValue', v) })
</script>
