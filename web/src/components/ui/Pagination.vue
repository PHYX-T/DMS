<template>
  <nav class="flex items-center justify-between text-sm" role="navigation" aria-label="Pagination">
    <button class="px-3 py-2 rounded border border-[var(--border)] hocus:bg-[var(--muted)]" :disabled="page<=1" @click="$emit('update:page', page-1)">Prev</button>
    <div class="flex items-center gap-1">
      <button v-for="p in pages" :key="p" class="px-3 py-2 rounded" :class="p===page ? 'bg-[var(--accent)] text-white' : 'hocus:bg-[var(--muted)]'" @click="$emit('update:page', p)">{{ p }}</button>
    </div>
    <button class="px-3 py-2 rounded border border-[var(--border)] hocus:bg-[var(--muted)]" :disabled="page>=pageCount" @click="$emit('update:page', page+1)">Next</button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ page: number; pageSize: number; total: number }>()
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const pages = computed(() => Array.from({ length: pageCount.value }).map((_,i)=>i+1))
</script>

