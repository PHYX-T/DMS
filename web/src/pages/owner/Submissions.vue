<template>
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Owner Submissions</h2>
    <div v-if="system.minorRevisionPolicy" class="px-3 py-2 text-sm rounded border border-[var(--border)] bg-[var(--muted)]">Minor-approval: Owner-only approvals are enabled by policy.</div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2">
        <SubmissionWizard :item="item" />
      </div>
      <aside class="space-y-3">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <h3 class="font-medium mb-2">Current Document</h3>
          <div class="text-sm"><strong>{{ item.title }}</strong></div>
          <div class="text-xs text-[var(--content-muted)]">{{ item.id }} — v{{ item.version }}</div>
          <div class="mt-2 text-xs flex items-center gap-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="item.minorPolicy" /> Minor Policy (OwnerApproval)
            </label>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import SubmissionWizard from '@/components/workflow/SubmissionWizard.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useSystemStore } from '@/stores/system'

const wf = useWorkflowStore()
const system = useSystemStore()
// Mock a draft item for the wizard context
const item = wf.queue[0] || { id: 'ABC-XY-ENG-PRO-001', title: 'Quality Policy', version: '3.2', state: 'Draft', ownerId: 'u1', controllerId: 'u2', minorPolicy: false, slaDueAt: Date.now() + 3*24*60*60*1000 }
</script>
