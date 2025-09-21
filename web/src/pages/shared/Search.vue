<template>
  <section class="space-y-4">
    <ContentHeader>
      <template #title>Search</template>
      <template #actions>
        <div class="flex items-center gap-2">
          <Input ref="searchInput" v-model="q" placeholder="Type to search… ( / to focus )" @input="onType" />
          <Button @click="applyFilters">Search</Button>
        </div>
      </template>
    </ContentHeader>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Filters -->
      <aside class="md:col-span-1">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 hidden md:block">
          <h3 class="font-medium mb-2">Filters</h3>
          <div class="space-y-3">
            <Select v-model="filters.CompanyCode" label="Company" :options="companies" />
            <Select v-model="filters.SubsidiaryCode" label="Subsidiary" :options="subsidiaries" />
            <Select v-model="filters.DepartmentCode" label="Department" :options="departments" />
            <Select v-model="filters.DocumentTypeCode" label="Type" :options="types" />
            <Select v-model="filters.Status" label="Status" :options="statuses" />
            <Input v-model="filters.Owner" label="Owner" placeholder="Owner ID or name" />
            <div class="grid grid-cols-2 gap-2">
              <DatePicker v-model="filters.ReviewFrom" label="Review from" />
              <DatePicker v-model="filters.ReviewTo" label="Review to" />
            </div>
            <Input v-model="filters.Keywords" label="Keywords" placeholder="comma,separated" />
            <div class="grid grid-cols-2 gap-2">
              <Select v-model="filters.RetentionPolicy" label="Retention" :options="retentionPolicies" />
              <Input v-model.number="filters.RetentionMonths" label="Months" type="number" />
            </div>
            <div class="flex gap-2">
              <Button size="sm" @click="applyFilters">Apply</Button>
              <Button size="sm" variant="secondary" @click="clearFilters">Clear</Button>
            </div>
          </div>
        </div>

        <!-- Mobile collapsible -->
        <div class="md:hidden">
          <details class="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <summary class="px-4 py-3 font-medium cursor-pointer">Filters</summary>
            <div class="p-4 space-y-3">
              <Select v-model="filters.CompanyCode" label="Company" :options="companies" />
              <Select v-model="filters.SubsidiaryCode" label="Subsidiary" :options="subsidiaries" />
              <Select v-model="filters.DepartmentCode" label="Department" :options="departments" />
              <Select v-model="filters.DocumentTypeCode" label="Type" :options="types" />
              <Select v-model="filters.Status" label="Status" :options="statuses" />
              <Input v-model="filters.Owner" label="Owner" placeholder="Owner ID or name" />
              <div class="grid grid-cols-2 gap-2">
                <DatePicker v-model="filters.ReviewFrom" label="Review from" />
                <DatePicker v-model="filters.ReviewTo" label="Review to" />
              </div>
              <Input v-model="filters.Keywords" label="Keywords" placeholder="comma,separated" />
              <div class="grid grid-cols-2 gap-2">
                <Select v-model="filters.RetentionPolicy" label="Retention" :options="retentionPolicies" />
                <Input v-model.number="filters.RetentionMonths" label="Months" type="number" />
              </div>
            </div>
          </details>
          <div class="sticky bottom-16 inset-x-0 p-3 bg-gradient-to-t from-[var(--bg)] to-transparent">
            <Button class="w-full" @click="applyFilters">Apply Filters</Button>
          </div>
        </div>
      </aside>

      <!-- Results -->
      <div class="md:col-span-3 space-y-3">
        <div class="flex items-center justify-between text-sm text-[var(--content-muted)]">
          <div>{{ total }} results</div>
          <div>
            <span class="mr-2">Recent:</span>
            <button v-for="(h,i) in history" :key="i" class="px-2 py-1 rounded bg-[var(--muted)] hocus:bg-[var(--border)] mr-2" @click="applyHistory(h)">{{ h.q || 'All' }}</button>
          </div>
        </div>
        <div v-if="loading">
          <Skeleton class="h-16 mb-2" />
          <Skeleton class="h-16 mb-2" />
          <Skeleton class="h-16" />
        </div>
        <EmptyState v-else-if="!results.length">
          <template #title>No results</template>
          <template #desc>Try adding Department or Type filters.</template>
        </EmptyState>
        <PullToRefresh v-else @refresh="applyFilters">
          <div class="grid grid-cols-1 gap-3">
            <article v-for="(r,idx) in results" :key="r.ID" :class="['p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg cursor-pointer', selectedIndex===idx && 'ring-2 ring-[var(--accent)]']" @click="open(r)">
              <div class="flex items-center justify-between">
                <div class="font-medium truncate mr-2">{{ r.Title }}</div>
                <Badge v-if="r.Status==='Approved'" kind="info">Latest Approved</Badge>
              </div>
              <div class="text-xs text-[var(--content-muted)] mt-1 flex flex-wrap gap-3">
                <span>ID: {{ r.ID }}</span>
                <span>Status: {{ r.Status }}</span>
                <span>Version: {{ r.Version }}</span>
                <span>Owner: {{ r.Owner }}</span>
                <span>Controller: {{ r.Controller }}</span>
                <span>Updated: {{ r.Updated }}</span>
              </div>
              <div class="mt-2 flex gap-2">
                <Button size="sm" @click.stop="open(r)">Open</Button>
                <Button size="sm" variant="secondary" @click.stop="copy(r)">Copy Link</Button>
                <Button size="sm" variant="secondary" @click.stop="saveCurrentFilter">Save Filter</Button>
              </div>
            </article>
          </div>
        </PullToRefresh>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Badge from '@/components/ui/Badge.vue'
import PullToRefresh from '@/components/ui/PullToRefresh.vue'

const route = useRoute(); const router = useRouter()
const searchInput = ref<HTMLInputElement | null>(null)
const q = ref((route.query.q as string) || '')
const loading = ref(false)
const results = ref<any[]>([])
const total = ref(0)
const selectedIndex = ref(-1)

// Filters state
const filters = reactive({
  CompanyCode: (route.query.company as string) || '',
  SubsidiaryCode: (route.query.subsidiary as string) || '',
  DepartmentCode: (route.query.department as string) || '',
  DocumentTypeCode: (route.query.type as string) || '',
  Status: (route.query.status as string) || '',
  Owner: (route.query.owner as string) || '',
  ReviewFrom: (route.query.rfrom as string) || '',
  ReviewTo: (route.query.rto as string) || '',
  Keywords: (route.query.kw as string) || '',
  RetentionPolicy: (route.query.rpolicy as string) || '',
  RetentionMonths: Number(route.query.rmonths || '') || undefined as number | undefined,
})

// Mock options (replace with API-driven lists)
const opt = (arr: string[]) => arr.map(v => ({ value: v, label: v }))
const companies = opt(['ABC','QMS'])
const subsidiaries = opt(['XY','ZZ'])
const departments = opt(['ENG','OPS','QA'])
const types = opt(['PRO','POL','WIN','MAN'])
const statuses = opt(['Draft','Review','Approved','Archived'])
const retentionPolicies = opt(['WORM','STANDARD'])

// History cache
const HISTORY_KEY = 'search:history'
const history = ref<{ q: string, filters: Record<string, any> }[]>([])
function loadHistory() {
  try { history.value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { history.value = [] }
}
function pushHistory(entry: { q: string, filters: Record<string, any> }) {
  const list = [entry, ...history.value.filter(h => h.q !== entry.q || JSON.stringify(h.filters) !== JSON.stringify(entry.filters))].slice(0,5)
  history.value = list; try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)) } catch {}
}
function applyHistory(h: { q: string, filters: Record<string, any> }) {
  q.value = h.q; Object.assign(filters, h.filters); applyFilters()
}

// Debounced search
let timer: number | undefined
function onType() { if (timer) clearTimeout(timer); timer = window.setTimeout(applyFilters, 250) }

function toQuery() {
  return {
    q: q.value || undefined,
    company: filters.CompanyCode || undefined,
    subsidiary: filters.SubsidiaryCode || undefined,
    department: filters.DepartmentCode || undefined,
    type: filters.DocumentTypeCode || undefined,
    status: filters.Status || undefined,
    owner: filters.Owner || undefined,
    rfrom: filters.ReviewFrom || undefined,
    rto: filters.ReviewTo || undefined,
    kw: filters.Keywords || undefined,
    rpolicy: filters.RetentionPolicy || undefined,
    rmonths: filters.RetentionMonths || undefined,
  }
}

function clearFilters() {
  Object.assign(filters, { CompanyCode:'', SubsidiaryCode:'', DepartmentCode:'', DocumentTypeCode:'', Status:'', Owner:'', ReviewFrom:'', ReviewTo:'', Keywords:'', RetentionPolicy:'', RetentionMonths: undefined })
}

function applyFilters() {
  loading.value = true
  router.replace({ query: toQuery() })
  // Mock results; replace with API call
  setTimeout(() => {
    const base = [
      { ID:'ABC-XY-ENG-PRO-001', Title:'Quality Policy', Status:'Approved', Version:'3.2', Owner:'u1', Controller:'u2', Updated:'2025-09-01' },
      { ID:'QMS-ZZ-QA-POL-010', Title:'Safety Policy', Status:'Review', Version:'1.4', Owner:'u3', Controller:'u2', Updated:'2025-08-28' },
    ]
    const ql = q.value.toLowerCase()
    results.value = base.filter(r => !q.value || r.ID.toLowerCase().includes(ql) || r.Title.toLowerCase().includes(ql))
    total.value = results.value.length
    selectedIndex.value = results.value.length ? 0 : -1
    loading.value = false
    pushHistory({ q: q.value, filters: { ...filters } })
  }, 200)
}

function open(r: any) { router.push({ name: 'document.view', params: { id: r.ID } }) }
async function copy(r: any) {
  try { await navigator.clipboard.writeText(`${location.origin}/documents/${r.ID}`) } catch {}
}
function saveCurrentFilter() {
  const name = prompt('Name this filter:')
  if (!name) return
  pushHistory({ q: name, filters: { ...filters } })
}

// Keyboard navigation and shortcuts
function onKey(e: KeyboardEvent) {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault(); (searchInput.value as any)?.focus?.(); return
  }
  if (e.key === 'ArrowDown') { e.preventDefault(); if (results.value.length) selectedIndex.value = Math.min(results.value.length - 1, (selectedIndex.value + 1)) }
  if (e.key === 'ArrowUp') { e.preventDefault(); if (results.value.length) selectedIndex.value = Math.max(0, (selectedIndex.value - 1)) }
  if (e.key === 'Enter' && selectedIndex.value >= 0) { e.preventDefault(); open(results.value[selectedIndex.value]) }
  if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); saveCurrentFilter() }
}

onMounted(() => { loadHistory(); applyFilters(); window.addEventListener('keydown', onKey) })
onUnmounted(() => window.removeEventListener('keydown', onKey))

// Keep state in sync with route
watch(() => route.query, (qparams) => {
  q.value = (qparams.q as string) || q.value
})
</script>
