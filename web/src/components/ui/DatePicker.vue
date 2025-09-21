<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium">{{ label }}</label>
    <input :id="id" v-model="model" type="date" class="mt-1 w-full rounded-lg border border-[var(--border)] bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] p-2.5" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ id?: string; label?: string; modelValue?: string }>()
const emit = defineEmits<{ (e:'update:modelValue', v: string): void }>()
const model = computed({ get: () => props.modelValue ?? '', set: (v: string) => emit('update:modelValue', v) })
</script>

