<template>
  <section class="space-y-6">
    <ContentHeader>
      <template #title>Controller Console</template>
      <template #subtitle>Validate, publish, archive</template>
    </ContentHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Validation queue with swipe actions on mobile -->
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0 e2 overflow-hidden">
        <header class="px-4 py-3 border-b border-[var(--border)] font-medium">Validation Queue</header>
        <ul>
          <li v-for="(item,i) in sortedValidations" :key="item.id" class="relative select-none">
            <div class="absolute inset-y-0 right-2 flex items-center gap-2">
              <Button size="sm" variant="secondary">Fix</Button>
              <Button size="sm">Re-validate</Button>
            </div>
            <div class="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] touch-pan-y"
                 :style="{ transform: `translateX(${item.dragX||0}px)` }"
                 @touchstart="onTouchStart(i, $event)" @touchmove="onTouchMove(i, $event)" @touchend="onTouchEnd(i)">
              <div class="font-medium">{{ item.title }}</div>
              <div class="text-xs" :class="item.status==='Failed' ? 'text-[var(--error)]' : 'text-[var(--content-muted)]'">{{ item.status }}</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Publish queue -->
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Publish Queue</h3>
        <ul class="space-y-2">
          <li v-for="p in publishQueue" :key="p.id" class="flex items-center justify-between">
            <div class="truncate mr-2">{{ p.title }}</div>
            <div class="flex items-center gap-2"><Button size="sm" @click="onPublish(p)">Publish</Button><Button size="sm" variant="secondary">Hold</Button></div>
          </li>
        </ul>
        <EmptyState v-if="!publishQueue.length">
          <template #title>Nothing to publish</template>
          <template #desc>Approved items will appear here.</template>
        </EmptyState>
      </div>

      <!-- Archive / Restore and Codes -->
      <div class="space-y-4">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <h3 class="font-medium mb-3">Archive / Restore</h3>
          <div class="flex gap-2">
            <Button size="sm">Archive</Button>
            <Button size="sm" variant="secondary">Restore</Button>
          </div>
        </div>
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <h3 class="font-medium mb-3">Code Lists</h3>
          <div class="flex flex-wrap gap-2">
            <RouterLink class="inline-flex items-center justify-center gap-2 rounded-lg font-medium px-3 py-2 text-sm bg-[var(--muted)] hocus:bg-[var(--border)]" to="/controller/codes">Company</RouterLink>
            <RouterLink class="inline-flex items-center justify-center gap-2 rounded-lg font-medium px-3 py-2 text-sm bg-[var(--muted)] hocus:bg-[var(--border)]" to="/controller/codes">Department</RouterLink>
            <RouterLink class="inline-flex items-center justify-center gap-2 rounded-lg font-medium px-3 py-2 text-sm bg-[var(--muted)] hocus:bg-[var(--border)]" to="/controller/codes">Types</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ContentHeader from '@/components/layout/ContentHeader.vue'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

type Item = { id: string; title: string; status: 'Failed'|'Passed'; dragX?: number }
const validations: Item[] = [
  { id: '1', title: 'Check metadata completeness', status: 'Failed' },
  { id: '2', title: 'Verify RetentionSchedule', status: 'Passed' },
]
const publishQueue = [ { id: '10', title: 'Quality Manual v3.2' } ]

const sortedValidations = validations.sort((a,b) => a.status === 'Failed' ? -1 : 1)
let touchStartX = 0
function onTouchStart(i: number, e: TouchEvent) { touchStartX = e.touches[0].clientX; sortedValidations[i].dragX = 0 }
function onTouchMove(i: number, e: TouchEvent) { const dx = e.touches[0].clientX - touchStartX; sortedValidations[i].dragX = Math.min(0, dx) }
function onTouchEnd(i: number) { if ((sortedValidations[i].dragX||0) > -40) sortedValidations[i].dragX = 0 }

const settings = useSettingsStore()
function onPublish(p: { id: string; title: string }) {
  // mock publish success
  fireConfetti()
}

function fireConfetti() {
  try {
    if (settings.reducedMotion) return
    const root = document.body
    const container = document.createElement('div')
    container.style.position = 'fixed'; container.style.inset = '0'; container.style.pointerEvents = 'none'; container.style.zIndex = '9999'
    root.appendChild(container)
    const colors = ['#57a8f8','#16a34a','#d97706','#dc2626']
    for (let i=0;i<60;i++) {
      const c = document.createElement('div')
      c.style.position = 'absolute'
      c.style.left = Math.random()*100 + 'vw'
      c.style.top = '-10px'
      c.style.width = '6px'; c.style.height = '10px'
      c.style.background = colors[Math.floor(Math.random()*colors.length)]
      c.style.opacity = '0.9'
      c.style.transform = `rotate(${Math.random()*360}deg)`
      const dur = 800 + Math.random()*600
      c.style.transition = `transform ${dur}ms ease-out, top ${dur}ms ease-out, opacity ${dur}ms ease-out`
      container.appendChild(c)
      requestAnimationFrame(() => {
        c.style.top = '100vh'
        c.style.transform = `translateY(0) rotate(${360+Math.random()*360}deg)`
        c.style.opacity = '0.8'
      })
    }
    setTimeout(() => { container.remove() }, 1600)
  } catch {}
}
</script>
