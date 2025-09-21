<template>
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Owner Reviews</h2>
    <div v-if="!items.length">
      <EmptyState>
        <template #title>No reviews</template>
        <template #desc>Documents assigned for your review will appear here.</template>
      </EmptyState>
    </div>
    <PullToRefresh v-else @refresh="refresh">
      <div class="grid grid-cols-1 gap-3">
        <ReviewerPanel v-for="it in items" :key="it.id" :item="it" />
      </div>
    </PullToRefresh>
  </section>
</template>

<script setup lang="ts">
import EmptyState from '@/components/ui/EmptyState.vue'
import ReviewerPanel from '@/components/workflow/ReviewerPanel.vue'
import { useWorkflowStore } from '@/stores/workflow'
import PullToRefresh from '@/components/ui/PullToRefresh.vue'

const wf = useWorkflowStore()
// Mock queue items for review context
const items = wf.queue.length ? wf.queue : [
  { id: 'ABC-XY-ENG-PRO-001', title: 'Quality Policy', version: '3.2', state: 'Review', ownerId: 'u1', controllerId: 'u2', minorPolicy: false, slaDueAt: Date.now() + 3*24*60*60*1000 },
]
function refresh() { /* hook to backend */ }
</script>
