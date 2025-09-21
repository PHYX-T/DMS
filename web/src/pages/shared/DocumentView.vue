<template>
  <section class="space-y-4">
    <ContentHeader>
      <template #title>{{ doc?.Title || 'Document' }}</template>
      <template #subtitle>
        <span class="inline-flex items-center gap-2">
          <code class="text-xs bg-[var(--muted)] px-2 py-1 rounded">{{ id }}</code>
          <Button size="sm" variant="secondary" @click="copyId">Copy ID</Button>
          <Badge :kind="statusKind(doc?.Status)">{{ doc?.Status }}</Badge>
          <Badge v-if="doc?.Status==='Approved'" kind="info">Latest Approved</Badge>
        </span>
      </template>
      <template #actions>
        <!-- Version switcher -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-[var(--content-muted)]">Version</label>
          <select v-model="selectedVersionIdx" class="rounded border border-[var(--border)] bg-white p-2 text-sm" :disabled="disableVersionSwitch">
            <option v-for="(v,i) in versions" :key="i" :value="i">{{ v.version }} — {{ v.status }}</option>
          </select>
        </div>
      </template>
    </ContentHeader>

    <div v-if="banner" class="px-4 py-3 rounded border border-[var(--border)] bg-[var(--muted)] text-sm">{{ banner }}</div>

    <!-- Role-based actions -->
    <div class="flex flex-wrap gap-2">
      <template v-if="role==='DocumentOwner'">
        <Input v-model="revisionNotes" placeholder="Add revision notes" class="w-64" />
        <Button size="sm">Submit Revision</Button>
      </template>
      <template v-else-if="role==='DocumentController'">
        <Button size="sm">Publish PDF</Button>
        <Button size="sm" variant="secondary">Archive/Obsolete Previous</Button>
        <Button size="sm" variant="secondary">Restore</Button>
      </template>
      <template v-else-if="role==='QMS'">
        <Badge :kind="compliance.overdue ? 'warn' : 'ok'">Review {{ compliance.overdue ? 'Overdue' : 'OK' }}</Badge>
        <Badge :kind="compliance.retNear ? 'warn' : 'ok'">Retention {{ compliance.retNear ? 'Nearing End' : 'OK' }}</Badge>
      </template>
      <template v-else-if="role==='Admin'">
        <Button size="sm" variant="secondary">Impersonate (read-only)</Button>
        <Button size="sm" variant="secondary">Manage Access</Button>
      </template>
      <!-- ExternalAuditor: no actions (read-only) -->
    </div>

    <div class="flex items-center justify-between sm:hidden">
      <Button size="sm" variant="secondary" @click="metaOpen = true">Details</Button>
    </div>

    <Tabs v-model="tab" :tabs="['Preview','Metadata','Versions','Related','History']">
      <template #default="{ index }">
        <div v-if="index===0">
          <!-- PDF Preview -->
          <div class="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)] e2">
            <iframe :src="pdfUrl" title="PDF Preview" class="w-full h-[70vh]"></iframe>
          </div>
        </div>
        <div v-else-if="index===1" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 class="font-medium mb-2">General</h3>
            <dl class="space-y-1">
              <div><dt class="text-[var(--content-muted)]">Company</dt><dd>{{ doc?.Metadata.CompanyCode }}</dd></div>
              <div><dt class="text-[var(--content-muted)]">Subsidiary</dt><dd>{{ doc?.Metadata.SubsidiaryCode }}</dd></div>
              <div><dt class="text-[var(--content-muted)]">Department</dt><dd>{{ doc?.Metadata.DepartmentCode }}</dd></div>
              <div><dt class="text-[var(--content-muted)]">Type</dt><dd>{{ doc?.Metadata.DocumentTypeCode }}</dd></div>
              <div><dt class="text-[var(--content-muted)]">Issue Date</dt><dd>{{ doc?.Metadata.IssueDate }}</dd></div>
              <div><dt class="text-[var(--content-muted)]">Review Date</dt><dd>{{ doc?.Metadata.ReviewDate }}</dd></div>
            </dl>
          </div>
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 class="font-medium mb-2">Retention</h3>
            <div>Policy: {{ doc?.Metadata.RetentionSchedule.policy }}</div>
            <div>Months: {{ doc?.Metadata.RetentionSchedule.durationMonths }}</div>
            <div>Start: {{ doc?.Metadata.RetentionSchedule.startDate }}</div>
            <h3 class="font-medium mt-4 mb-2">Keywords</h3>
            <div class="flex flex-wrap gap-2">
              <Tag v-for="k in (doc?.Metadata.Keywords || [])" :key="k">{{ k }}</Tag>
            </div>
          </div>
        </div>
        <div v-else-if="index===2" class="space-y-2">
          <div class="text-sm text-[var(--content-muted)]">Switch versions using the control above.</div>
          <ul class="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <li v-for="v in versions" :key="v.version" class="px-4 py-2 flex items-center justify-between">
              <div>
                <div class="font-medium">v{{ v.version }}</div>
                <div class="text-xs text-[var(--content-muted)]">{{ v.status }}</div>
              </div>
              <Button size="sm" :disabled="role==='EndUser' && v.status!=='Approved'" @click="selectVersion(v)">Open</Button>
            </li>
          </ul>
        </div>
        <div v-else-if="index===3">
          <ul class="space-y-2">
            <li v-for="rid in doc?.RelatedDocuments || []" :key="rid">
              <RouterLink class="hocus:text-[var(--accent)]" :to="{ name: 'document.view', params: { id: rid } }">{{ rid }}</RouterLink>
            </li>
          </ul>
          <EmptyState v-if="!(doc?.RelatedDocuments || []).length">
            <template #title>No related documents</template>
            <template #desc>Related links will appear here.</template>
          </EmptyState>
        </div>
        <div v-else>
          <ol class="relative border-s border-[var(--border)] ml-4">
            <li v-for="h in (doc?.ChangeHistory || [])" :key="h.timestamp" class="ms-4 py-2">
              <div class="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-[var(--accent)]"></div>
              <time class="text-xs text-[var(--content-muted)]">{{ h.timestamp }}</time>
              <div class="font-medium">{{ h.action }} – v{{ h.version }}</div>
              <div class="text-sm text-[var(--content-muted)]">by {{ h.userId }}</div>
            </li>
          </ol>
          <EmptyState v-if="!(doc?.ChangeHistory || []).length">
            <template #title>No history</template>
            <template #desc>Audit events will appear here.</template>
          </EmptyState>
        </div>
      </template>
    </Tabs>
  </section>
  <Drawer :open="metaOpen" title="Document details" @close="metaOpen=false">
    <div class="space-y-3 text-sm">
      <div><strong>ID</strong>: {{ id }}</div>
      <div><strong>Status</strong>: {{ doc?.Status }}</div>
      <div><strong>Owner</strong>: {{ doc?.Owner }}</div>
      <div><strong>Controller</strong>: {{ doc?.Controller }}</div>
      <div><strong>Company</strong>: {{ doc?.Metadata.CompanyCode }}</div>
      <div><strong>Dept</strong>: {{ doc?.Metadata.DepartmentCode }}</div>
      <div><strong>Issue</strong>: {{ doc?.Metadata.IssueDate }}</div>
      <div><strong>Review</strong>: {{ doc?.Metadata.ReviewDate }}</div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Tabs from '@/components/ui/Tabs.vue'
import Badge from '@/components/ui/Badge.vue'
import Tag from '@/components/ui/Tag.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Drawer from '@/components/ui/Drawer.vue'
import type { Document } from '@/types/strict'
import { useAuthStore } from '@/stores/auth'

const route = useRoute(); const router = useRouter()
const id = route.params.id as string
const auth = useAuthStore()
const role = computed(() => auth.effectiveRole)

const tab = ref(0)
const banner = ref('')
const revisionNotes = ref('')
const metaOpen = ref(false)

const mock: Document = {
  ID: id,
  Title: 'Quality Policy',
  Version: '3.2',
  Status: 'Approved',
  Owner: 'u1',
  Controller: 'u2',
  Metadata: {
    CompanyCode: 'ABC', SubsidiaryCode: 'HQ', DepartmentCode: 'QMS', DocumentTypeCode: 'PRO',
    IssueDate: '2025-06-01', ReviewDate: '2026-06-01', Keywords: ['quality','policy'], Description: 'Corporate quality policy',
    RetentionSchedule: { policy: 'STANDARD', durationMonths: 24, startDate: '2025-06-01' }
  },
  Files: { PDF: 'about:blank' },
  ChangeHistory: [ { version: '3.2', action: 'Approved', userId: 'u2', timestamp: '2025-09-01T10:00:00Z' }, { version: '3.1', action: 'Revised', userId: 'u1', timestamp: '2025-08-20T09:00:00Z' } ],
  RelatedDocuments: ['ABC-XY-ENG-PRO-002']
}

const versions = ref<Array<{ version: string; status: string; pdf: string }>>([
  { version: '3.2', status: 'Approved', pdf: mock.Files.PDF },
  { version: '3.1', status: 'Archived', pdf: mock.Files.PDF },
  { version: '2.0', status: 'Obsolete', pdf: mock.Files.PDF },
])
const selectedVersionIdx = ref(0)
const doc = ref<Document | null>(mock)

const pdfUrl = computed(() => {
  const v = versions.value[selectedVersionIdx.value]
  const base = (import.meta as any).env?.VITE_API_BASE || '/api'
  // Mask storage URLs; route through API proxy by id/version
  return v ? `${base}/files/pdf/${encodeURIComponent(id)}?v=${encodeURIComponent(v.version)}` : 'about:blank'
})
const disableVersionSwitch = computed(() => false)

function statusKind(status?: string) { return status === 'Approved' ? 'ok' : status === 'Draft' ? 'info' : status === 'Archived' || status === 'Obsolete' ? 'warn' : 'info' }
function selectVersion(v: { version: string; status: string; pdf: string }) {
  const i = versions.value.findIndex(x => x.version === v.version)
  if (i >= 0) {
    if (role.value === 'EndUser' && v.status !== 'Approved') return
    selectedVersionIdx.value = i
  }
}

function copyId() { navigator.clipboard?.writeText(id) }

// Compliance flags for QMS
const compliance = computed(() => {
  const today = new Date().toISOString().slice(0,10)
  const overdue = (doc.value?.Metadata.ReviewDate || '') < today
  const start = new Date(doc.value?.Metadata.RetentionSchedule.startDate || doc.value?.Metadata.IssueDate || today)
  const months = doc.value?.Metadata.RetentionSchedule.durationMonths || 0
  const end = new Date(start); end.setMonth(end.getMonth() + months)
  const retNear = end.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
  return { overdue, retNear }
})

// EndUser obsolete redirect to latest approved
onMounted(() => {
  const requestedV = (route.query.v as string) || versions.value[0].version
  const i = versions.value.findIndex(v => v.version === requestedV)
  if (i >= 0) selectedVersionIdx.value = i
  if (role.value === 'EndUser' || role.value === 'ExternalAuditor') {
    const v = versions.value[selectedVersionIdx.value]
    if (v && v.status !== 'Approved') {
      const latestApprovedIdx = versions.value.findIndex(x => x.status === 'Approved')
      if (latestApprovedIdx >= 0) {
        selectedVersionIdx.value = latestApprovedIdx
        banner.value = "We’ve sent you to the latest approved version."
      }
    }
  }
})

watch(selectedVersionIdx, (i, prev) => {
  const v = versions.value[i]
  if ((role.value === 'EndUser' || role.value === 'ExternalAuditor') && v && v.status !== 'Approved') {
    const latestApprovedIdx = versions.value.findIndex(x => x.status === 'Approved')
    if (latestApprovedIdx >= 0) {
      selectedVersionIdx.value = latestApprovedIdx
      banner.value = "We’ve sent you to the latest approved version."
      return
    }
  }
  router.replace({ query: { ...route.query, v: v?.version } })
})
</script>
