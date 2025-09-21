<template>
  <div>
    <div role="tablist" class="flex gap-2 border-b border-[var(--border)]">
      <button v-for="(t,i) in tabs" :key="i" role="tab" :aria-selected="model===i" class="px-3 py-2 -mb-px border-b-2" :class="model===i ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--content-muted)] hocus:text-[var(--content)]'" @click="update(i)">{{ t }}</button>
    </div>
    <div class="py-3"><slot :index="model" /></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ modelValue?: number; tabs: string[] }>()
const emit = defineEmits<{ (e:'update:modelValue', v: number): void }>()
const model = computed({ get: () => props.modelValue ?? 0, set: (v:number) => emit('update:modelValue', v) })
const update = (i:number) => { model.value = i }
</script>

