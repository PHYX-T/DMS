<template>
  <section class="space-y-6">
    <ContentHeader>
      <template #title>Welcome</template>
      <template #subtitle>Find what you need quickly</template>
    </ContentHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <!-- Quick Search -->
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <div class="flex gap-2">
            <Input v-model="q" placeholder="Search documents" class="flex-1" />
            <Button @click="goSearch">Search</Button>
          </div>
        </div>

        <!-- Recent -->
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium">Recent</h3>
            <Button variant="link" @click="goAll">View all</Button>
          </div>
          <div v-if="loading">
            <Skeleton class="h-8 mb-2" />
            <Skeleton class="h-8 mb-2" />
            <Skeleton class="h-8" />
          </div>
          <div v-else-if="!recent.length">
            <EmptyState>
              <template #title>No recent documents</template>
              <template #desc>Try a search or browse categories.</template>
            </EmptyState>
          </div>
          <ul v-else class="divide-y divide-[var(--border)]">
            <li v-for="d in recent" :key="d.ID" class="py-2 flex items-center justify-between">
              <div>
                <RouterLink :to="`/documents/${d.ID}`" class="hocus:text-[var(--accent)]">{{ d.Title }}</RouterLink>
                <div class="text-xs text-[var(--content-muted)]">{{ d.ID }}</div>
              </div>
              <Badge kind="info">Latest Approved</Badge>
            </li>
          </ul>
        </div>
      </div>

      <!-- Saved Filters -->
      <div class="space-y-4">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <div class="flex items-center justify-between mb-3"><h3 class="font-medium">Saved Filters</h3><Button variant="link">Manage</Button></div>
          <div v-if="!filters.length" class="text-sm text-[var(--content-muted)]">No saved filters.</div>
          <ul v-else class="space-y-2">
            <li v-for="f in filters" :key="f.name"><Button variant="secondary" class="w-full justify-start" @click="applyFilter(f)">🔎 {{ f.name }}</Button></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const router = useRouter()
const q = ref('')
const loading = ref(true)
const recent = ref<{ ID: string; Title: string }[]>([])
const filters = ref<{ name: string; query: Record<string,string> }[]>([
  { name: 'Approved This Month', query: { status: 'Approved', range: '30d' } },
])

onMounted(() => {
  setTimeout(() => { recent.value = [ { ID: 'ABC-XY-ENG-PRO-001', Title: 'Quality Policy' } ]; loading.value = false }, 300)
})

function goSearch() { router.push({ name: 'search', query: q.value ? { q: q.value } : undefined }) }
function goAll() { router.push({ name: 'documents' }) }
function applyFilter(f: { name: string; query: Record<string,string> }) { router.push({ name: 'search', query: f.query }) }
</script>

