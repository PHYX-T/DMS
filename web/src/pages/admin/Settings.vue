<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Admin – Settings</h2>
    </div>

    <AdminStatusBar />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Appearance</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Theme</label>
            <div class="flex gap-2">
              <button v-for="t in themes" :key="t" class="px-3 py-2 rounded border border-[var(--border)]"
                      :class="theme===t ? 'bg-[var(--accent)] text-white' : 'hocus:bg-[var(--muted)]'"
                      @click="setTheme(t)">{{ t }}</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Density</label>
            <div class="flex gap-2">
              <button v-for="d in densities" :key="d" class="px-3 py-2 rounded border border-[var(--border)]"
                      :class="density===d ? 'bg-[var(--accent)] text-white' : 'hocus:bg-[var(--muted)]'"
                      @click="setDensity(d)">{{ d }}</button>
            </div>
          </div>
          <div>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="reduced" @change="onReducedChange"> Reduced motion (OS respected)
            </label>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
        <h3 class="font-medium">SSO (Microsoft)</h3>
        <div class="text-sm">Status: <Badge :kind="system.ssoConfigured ? 'ok' : 'warn'">{{ system.ssoConfigured ? 'configured' : 'not configured' }}</Badge></div>
        <div class="text-xs text-[var(--content-muted)]">Client ID and Tenant are stored server-side.</div>
      </div>

      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
        <h3 class="font-medium">Minor Revision Policy</h3>
        <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" v-model="system.minorRevisionPolicy" /> Enable minor path (OwnerApproval)</label>
        <p class="text-xs text-[var(--content-muted)]">When enabled, minor changes may follow Draft → OwnerApproval → Approved with version +0.1.</p>
      </div>

      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3 md:col-span-2">
        <h3 class="font-medium">Telemetry (opt-in)</h3>
        <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" :checked="telemetry.enabled" @change="onTelemetryChange($event)" /> Allow anonymous usage analytics (page views and actions). Admins can view aggregated charts below.</label>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
          <ChartCard title="Page Views (30d)">
            <ul class="text-xs p-3">
              <li v-for="r in pageSeries" :key="r.day" class="flex items-center justify-between"><span>{{ r.day }}</span><span>{{ r.count }}</span></li>
            </ul>
          </ChartCard>
          <ChartCard title="Actions (30d)">
            <ul class="text-xs p-3">
              <li v-for="r in actionSeries" :key="r.day" class="flex items-center justify-between"><span>{{ r.day }}</span><span>{{ r.count }}</span></li>
            </ul>
          </ChartCard>
        </div>
        <p class="text-xs text-[var(--content-muted)]">GDPR: Data is anonymous and stored locally unless configured otherwise. Users can opt-in/out anytime. See Help for more.</p>
      </div>

      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
        <h3 class="font-medium">Retention Policy</h3>
        <p class="text-sm">{{ system.retentionPolicyNote }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminStatusBar from '@/components/admin/AdminStatusBar.vue'
import Badge from '@/components/ui/Badge.vue'
import type { ThemeName, Density } from '@/design/tokens'
import { applyTheme } from '@/design/tokens'
import { useSettingsStore } from '@/stores/settings'
import { useSystemStore } from '@/stores/system'
import { useTelemetryStore } from '@/stores/telemetry'
import ChartCard from '@/components/data/ChartCard.vue'

const system = useSystemStore()
const themes: ThemeName[] = ['light','dark','high-contrast']
const densities: Density[] = ['comfortable','compact']
const theme = ref<ThemeName>('light')
const density = ref<Density>('comfortable')
const reduced = ref(false)
const settings = useSettingsStore()
const telemetry = useTelemetryStore()

function setTheme(t: ThemeName) { theme.value = t; applyTheme(theme.value, density.value) }
function setDensity(d: Density) { density.value = d; applyTheme(theme.value, density.value) }
function onReducedChange() { settings.setReducedMotion(reduced.value) }
function onTelemetryChange(e: Event) { const v = (e.target as HTMLInputElement).checked; telemetry.toggle(v) }
const pageSeries = computed(() => telemetry.byDay('page'))
const actionSeries = computed(() => telemetry.byDay('action'))

onMounted(() => {
  try {
    const t = localStorage.getItem('ui:theme') as ThemeName | null
    const d = localStorage.getItem('ui:density') as Density | null
    if (t) theme.value = t
    if (d) density.value = d
  } catch {}
})
</script>
