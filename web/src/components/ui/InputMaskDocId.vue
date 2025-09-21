<template>
  <Input :id="id" v-model="text" :label="label" :placeholder="placeholder" :hint="hint" :error="error" @input="onInput" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Input from './Input.vue'

const props = withDefaults(defineProps<{ id?: string; modelValue?: string; label?: string; placeholder?: string; hint?: string; error?: string }>(), { placeholder: 'ABC-XY-ENG-PRO-001' })
const emit = defineEmits<{ (e:'update:modelValue', v: string): void }>()

const text = computed({
  get: () => props.modelValue ?? '',
  set: (v: string) => emit('update:modelValue', v),
})

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  let v = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  // Insert hyphens at positions 3,5,8,11? Correct pattern: AAA-BB-CCC-DDD-XXX
  // positions after letters: 3, 5 (AA A BB), 8 (BB CCC), 11 (CCC DDD)
  const parts = [v.slice(0,3), v.slice(3,5), v.slice(5,8), v.slice(8,11), v.slice(11,14)]
  v = parts.filter((p, i) => (i<4 ? p.length : true)).join('-').replace(/-+$/,'')
  text.value = v
}
</script>

