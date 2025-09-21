<template>
  <div class="relative">
    <label v-if="label" :for="id" class="block text-sm font-medium">{{ label }}</label>
    <input :id="id" v-model="query" :placeholder="placeholder" class="mt-1 w-full rounded-lg border border-[var(--border)] p-2.5 bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]" @focus="open=true" @keydown.down.prevent="highlight(1)" @keydown.up.prevent="highlight(-1)" @keydown.enter.prevent="chooseHighlighted()" @keydown.esc.prevent="open=false" />
    <ul v-if="open && filtered.length" class="absolute z-20 mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-card max-h-60 overflow-auto" role="listbox">
      <li v-for="(opt, i) in filtered" :key="opt.value" class="px-3 py-2 cursor-pointer" :class="i===hi ? 'bg-[var(--muted)]' : ''" @mousedown.prevent="select(opt)" role="option">{{ opt.label }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
interface Option { value: string; label: string }
const props = withDefaults(defineProps<{ id?: string; label?: string; modelValue?: string; options: Option[]; placeholder?: string }>(), { placeholder: 'Search…' })
const emit = defineEmits<{ (e:'update:modelValue', v: string): void }>()
const query = ref('')
const open = ref(false)
const hi = ref(-1)
const filtered = computed(() => {
  const q = query.value.toLowerCase()
  const out = q ? props.options.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) : props.options
  return out.slice(0, 100)
})
watch(() => props.modelValue, (v) => {
  const match = props.options.find(o => o.value === v)
  if (match) query.value = match.label
}, { immediate: true })

function select(opt: Option) { query.value = opt.label; emit('update:modelValue', opt.value); open.value = false }
function highlight(delta: number) { open.value = true; const max = filtered.value.length; hi.value = Math.max(0, Math.min(max-1, hi.value + delta)) }
function chooseHighlighted() { if (hi.value >= 0) select(filtered.value[hi.value]) }
</script>

