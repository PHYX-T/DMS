<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-[var(--content)]">{{ label }}</label>
    <div class="relative mt-1">
      <span v-if="$slots.leading" class="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--content-muted)]">
        <slot name="leading" />
      </span>
      <input ref="el"
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :aria-invalid="invalid || undefined"
        class="w-full rounded-lg border bg-white text-[var(--content)] placeholder-[var(--content-muted)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] dense-input transition-colors"
        :class="[ sizeClass, $slots.leading ? 'pl-10' : 'pl-3', $slots.trailing ? 'pr-10' : 'pr-3' ]"
        v-bind="$attrs"
      />
      <span v-if="$slots.trailing" class="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--content-muted)]">
        <slot name="trailing" />
      </span>
    </div>
    <p v-if="hint && !error" class="mt-1 text-xs text-[var(--content-muted)]">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-[var(--error)]">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, defineExpose } from 'vue'
const props = withDefaults(defineProps<{ id?: string; label?: string; modelValue?: string | number; type?: string; placeholder?: string; size?: 'sm'|'md'|'lg'; hint?: string; error?: string; invalid?: boolean }>(), { type: 'text', size: 'md' })
const emit = defineEmits<{ (e:'update:modelValue', v: string | number): void }>()
const model = computed({ get: () => props.modelValue as any, set: (v: any) => emit('update:modelValue', v) })
const sizeClass = computed(() => props.size === 'sm' ? 'py-2 text-sm' : props.size === 'lg' ? 'py-3 text-base' : 'py-2.5 text-sm')
const el = ref<HTMLInputElement | null>(null)
defineExpose({ focus: () => el.value?.focus() })
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<!-- end -->
