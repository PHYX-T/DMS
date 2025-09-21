<template>
  <div class="touch-safe" :style="{ height }">
    <VirtualList :items="rows" :item-size="rowHeight" :height="numericHeight">
      <template #default="{ item, index }">
        <div class="grid w-full" :style="gridStyle" role="row">
          <div v-for="(c,i) in columns" :key="i" class="px-3 py-2 dense-px dense-py border-b border-[var(--border)]" role="gridcell">
            <slot :name="`cell:${c.key}`" :row="item" :index="index">{{ item[c.key] }}</slot>
          </div>
          <div v-if="$slots.actions" class="px-3 py-2 dense-px dense-py border-b border-[var(--border)]">
            <slot name="actions" :row="item" :index="index" />
          </div>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VirtualList from '@/components/VirtualList.vue'

const props = withDefaults(defineProps<{
  columns: { key: string; label: string; width?: string }[]
  rows: any[]
  height?: string
  rowHeight?: number
  includeActions?: boolean
}>(), { height: '60vh', rowHeight: 44, includeActions: false })

const numericHeight = computed(() => {
  const m = /^(\d+)(px|vh)$/.exec(props.height || '')
  if (!m) return 480
  const val = Number(m[1])
  return m[2] === 'vh' ? Math.round((val / 100) * window.innerHeight) : val
})

const gridStyle = computed(() => ({
  gridTemplateColumns: props.columns.map(c => c.width ?? '1fr').concat($slots.actions ? ['auto'] : []).join(' '),
}))
</script>

<style scoped>
:host { display: block; }
</style>

