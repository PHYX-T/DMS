<template>
  <div class="relative overflow-auto" :style="{ maxHeight }">
    <table class="min-w-full text-sm">
      <thead class="sticky top-0 bg-[var(--surface)] z-10 border-b border-[var(--border)]">
        <tr>
          <th v-for="(c,i) in columns" :key="i" class="text-left font-medium px-3 py-2 dense-px dense-py text-[var(--content-muted)]">{{ c.label }}</th>
          <th v-if="$slots.actions" class="px-3 py-2 dense-px dense-py"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in pagedRows" :key="rowKey(row, r)" class="border-b border-[var(--border)] hover:bg-[var(--muted)]">
          <td v-for="(c,i) in columns" :key="i" class="px-3 py-2 dense-px dense-py">
            <slot :name="`cell:${c.key}`" :row="row">{{ row[c.key] }}</slot>
          </td>
          <td v-if="$slots.actions" class="px-3 py-2 dense-px dense-py">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
    <slot name="empty" v-if="!rows.length" />
    <div v-if="showPagination" class="p-2 border-t border-[var(--border)] bg-[var(--surface)]">
      <Pagination v-model:page="page" :page-size="pageSize" :total="rows.length" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Pagination from '@/components/ui/Pagination.vue'
const props = withDefaults(defineProps<{ columns: { key: string; label: string }[]; rows: any[]; maxHeight?: string; rowKey?: (row:any, i:number)=>string|number; pageSize?: number }>(), { maxHeight: '60vh', rowKey: (_:any,i:number)=>i, pageSize: 50 })
const page = ref(1)
const start = computed(() => (page.value - 1) * (props.pageSize || 50))
const end = computed(() => start.value + (props.pageSize || 50))
const pagedRows = computed(() => props.rows.slice(start.value, end.value))
const showPagination = computed(() => props.rows.length > (props.pageSize || 50))
</script>
