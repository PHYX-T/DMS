<template>
  <section class="space-y-6">
    <ContentHeader>
      <template #title>External Auditor Portal</template>
      <template #subtitle>Read-only access to approved documents</template>
    </ContentHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Search Approved Documents</h3>
        <div class="flex gap-2">
          <Input v-model="q" placeholder="Search by ID or title" class="flex-1" />
          <Button @click="goSearch">Search</Button>
        </div>
      </div>
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Export</h3>
        <Button size="sm" variant="secondary">Export Citations</Button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const router = useRouter()
const q = ref('')
function goSearch() { router.push({ name: 'search', query: { q: q.value, status: 'Approved' } }) }
</script>

