<template>
  <div ref="el" class="relative overflow-auto" @scroll="onScroll" @touchstart.passive="onStart" @touchmove.passive="onMove" @touchend.passive="onEnd">
    <div class="absolute left-0 right-0 top-0 flex items-center justify-center text-xs text-[var(--content-muted)]" :style="{ height: indicatorHeight + 'px' }">
      <span v-if="pulling || refreshing">{{ refreshing ? 'Refreshing…' : 'Pull to refresh' }}</span>
    </div>
    <div :style="{ transform: `translateY(${translateY}px)` }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits<{ (e:'refresh'): void }>()
const el = ref<HTMLDivElement | null>(null)
let startY = 0
const translateY = ref(0)
const pulling = ref(false)
const refreshing = ref(false)
const indicatorHeight = 28
function onScroll() { /* no-op: container needed for scroll */ }
function onStart(e: TouchEvent) {
  if (!el.value) return
  if (el.value.scrollTop > 0) return
  startY = e.touches[0].clientY
  pulling.value = true
}
function onMove(e: TouchEvent) {
  if (!pulling.value) return
  const dy = Math.max(0, e.touches[0].clientY - startY)
  translateY.value = Math.min(64, dy * 0.5)
}
function onEnd() {
  if (!pulling.value) return
  if (translateY.value >= 48) {
    refreshing.value = true
    emit('refresh')
    setTimeout(() => { refreshing.value = false; translateY.value = 0 }, 600)
  } else {
    translateY.value = 0
  }
  pulling.value = false
}
</script>

