<template>
  <div ref="container" class="relative overflow-auto" :style="{ height: height + 'px' }" @scroll="onScroll" role="list">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div v-for="(item, i) in visibleItems" :key="start + i" :style="itemStyle(i)" role="listitem">
        <slot :item="item" :index="start + i" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ items: unknown[]; itemSize: number; height?: number }>(), { height: 480 })

const container = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)

const totalHeight = computed(() => props.items.length * props.itemSize)
const itemsPerScreen = computed(() => Math.ceil((props.height || 480) / props.itemSize) + 4)
const start = computed(() => Math.max(0, Math.floor(scrollTop.value / props.itemSize) - 2))
const end = computed(() => Math.min(props.items.length, start.value + itemsPerScreen.value))
const visibleItems = computed(() => props.items.slice(start.value, end.value))

const onScroll = () => { if (container.value) scrollTop.value = container.value.scrollTop }
const itemStyle = (i: number) => ({ position: 'absolute', top: (start.value + i) * props.itemSize + 'px', left: 0, right: 0 })

onMounted(() => { if (container.value) scrollTop.value = container.value.scrollTop })
</script>

