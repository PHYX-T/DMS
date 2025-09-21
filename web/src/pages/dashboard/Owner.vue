<template>
  <section class="space-y-6">
    <ContentHeader>
      <template #title>Owner Dashboard</template>
      <template #subtitle>Track your documents and reviews</template>
      <template #actions><Button @click="startRevision">Start Revision</Button></template>
    </ContentHeader>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KPIStat label="My Documents" :value="42" />
        <KPIStat label="My Reviews" :value="7" />
        <KPIStat label="SLA Breaches" :value="1" delta="+1" />
      </div>

      <div class="lg:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <div class="flex items-center justify-between mb-3"><h3 class="font-medium">My Documents</h3><Button variant="link">View all</Button></div>
        <ul class="divide-y divide-[var(--border)]">
          <li v-for="d in docs" :key="d.id" class="py-2 flex items-center justify-between">
            <div class="truncate mr-2">
              <RouterLink :to="`/documents/${d.id}`" class="hocus:text-[var(--accent)]">{{ d.title }}</RouterLink>
              <div class="text-xs text-[var(--content-muted)]">{{ d.id }}</div>
            </div>
            <Tag :kind="statusKind(d.status)">{{ d.status }}</Tag>
          </li>
        </ul>
        <EmptyState v-if="!docs.length">
          <template #title>No documents</template>
          <template #desc>Create or upload a document to get started.</template>
        </EmptyState>
      </div>

      <div class="lg:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <div class="flex items-center justify-between mb-3"><h3 class="font-medium">My Reviews</h3><Button variant="link">View all</Button></div>
        <ul class="divide-y divide-[var(--border)]">
          <li v-for="r in reviews" :key="r.id" class="py-2 flex items-center justify-between">
            <div class="truncate mr-2">{{ r.title }}</div>
            <Button size="sm">Open</Button>
          </li>
        </ul>
        <EmptyState v-if="!reviews.length">
          <template #title>No pending reviews</template>
          <template #desc>You'll see items requiring your review here.</template>
        </EmptyState>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import KPIStat from '@/components/data/KPIStat.vue'
import Button from '@/components/ui/Button.vue'
import Tag from '@/components/ui/Tag.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const docs = [
  { id: 'ABC-XY-ENG-PRO-001', title: 'Quality Policy', status: 'Approved' },
  { id: 'ABC-XY-ENG-WIN-010', title: 'Work Instruction', status: 'Draft' },
]
const reviews: { id: string; title: string }[] = []

function statusKind(s: string) { return s === 'Approved' ? 'ok' : s === 'Draft' ? 'info' : 'warn' }
function startRevision() { /* CTA stub */ }
</script>

