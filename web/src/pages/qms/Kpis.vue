<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">QMS KPIs</h2>
      <div class="flex items-center gap-2">
        <Button size="sm" @click="exportPDF">Export PDF</Button>
        <Button size="sm" variant="secondary" @click="exportExcel">Export Excel</Button>
        <RouterLink class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hocus:bg-[var(--muted)]" :to="searchLink">Open in Search</RouterLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div class="md:col-span-2"><DatePicker v-model="from" label="From" /></div>
        <div class="md:col-span-2"><DatePicker v-model="to" label="To" /></div>
        <div><Select v-model="dept" label="Department" :options="departments" /></div>
        <div><Select v-model="type" label="Type" :options="types" /></div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <KPIStat label="Pending Review" :value="pending" />
      <KPIStat label="Overdue" :value="overdue" />
      <KPIStat label="Approaching Review" :value="approaching" />
      <KPIStat label="Latest Approved %" :value="approvedPct + '%'" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard class="lg:col-span-2" title="Cycle Time Trends (days)">
        <div class="text-xs text-[var(--content-muted)]">Trend chart stub (animations {{ reducedMotion ? 'off' : 'on' }})</div>
      </ChartCard>
      <ChartCard title="Latest Approved by Dept">
        <ul class="text-sm p-3">
          <li v-for="row in byDept" :key="row.key" class="flex items-center justify-between"><span>{{ row.key }}</span><span>{{ row.pct }}%</span></li>
        </ul>
      </ChartCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import KPIStat from '@/components/data/KPIStat.vue'
import Button from '@/components/ui/Button.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Select from '@/components/ui/Select.vue'
import ChartCard from '@/components/data/ChartCard.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

const toasts = useNotificationsStore()
const settings = useSettingsStore(); const { reducedMotion } = storeToRefs(settings)

// Filters
const from = ref(''); const to = ref(''); const dept = ref(''); const type = ref('')
const departments = ['ENG','OPS','QMS','QA'].map(v => ({ value: v, label: v }))
const types = ['PRO','POL','WIN','MAN'].map(v => ({ value: v, label: v }))

// Mock dataset
type Row = { id: string; dept: string; type: string; status: 'Draft'|'Review'|'Approved'|'Archived'; review: string; approvedAt?: string }
const data: Row[] = [
  { id: 'A', dept: 'ENG', type: 'PRO', status: 'Review', review: '2025-09-22' },
  { id: 'B', dept: 'QMS', type: 'POL', status: 'Approved', review: '2025-10-01', approvedAt: '2025-09-10' },
  { id: 'C', dept: 'OPS', type: 'WIN', status: 'Approved', review: '2025-09-25', approvedAt: '2025-09-12' },
  { id: 'D', dept: 'ENG', type: 'PRO', status: 'Draft', review: '2025-10-05' },
]

const filtered = computed(() => data.filter(r => (!dept.value || r.dept===dept.value) && (!type.value || r.type===type.value) && (!from.value || r.review >= from.value) && (!to.value || r.review <= to.value)))
const today = new Date().toISOString().slice(0,10)
const pending = computed(() => filtered.value.filter(r => r.status==='Review').length)
const overdue = computed(() => filtered.value.filter(r => r.status!=='Approved' && r.review < today).length)
const approaching = computed(() => filtered.value.filter(r => r.status!=='Approved' && r.review >= today && new Date(r.review).getTime() - Date.now() < 14*24*60*60*1000).length)
const approvedPct = computed(() => {
  const tot = filtered.value.length || 1
  const ok = filtered.value.filter(r => r.status==='Approved').length
  return Math.round((ok / tot) * 100)
})
const byDept = computed(() => {
  const groups: Record<string, { tot: number; ok: number }> = {}
  for (const r of filtered.value) { const g = groups[r.dept] || (groups[r.dept] = { tot:0, ok:0 }); g.tot++; if (r.status==='Approved') g.ok++ }
  return Object.entries(groups).map(([key, v]) => ({ key, pct: Math.round((v.ok/(v.tot||1))*100) }))
})

const searchLink = computed(() => ({ name: 'search', query: { department: dept.value || undefined, type: type.value || undefined, rfrom: from.value || undefined, rto: to.value || undefined } }))

function exportPDF() { toasts.push('Exported PDF (stub)', 'info') }
function exportExcel() { toasts.push('Exported Excel (stub)', 'info') }
</script>
