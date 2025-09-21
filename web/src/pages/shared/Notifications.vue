<template>
  <section class="space-y-6" aria-live="polite">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Notifications</h2>
      <div class="flex items-center gap-2">
        <select v-model="filter" class="rounded border border-[var(--border)] p-2 text-sm">
          <option value="">All</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
        <Button size="sm" variant="secondary" @click="markAllRead">Mark all read</Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <ul>
          <li v-for="n in list" :key="n.id" class="px-4 py-3 border-b border-[var(--border)]">
            <div class="flex items-start gap-2">
              <Badge :kind="n.level==='error' ? 'error' : n.level==='warn' ? 'warn' : 'info'">{{ n.type.replace('_',' ') }}</Badge>
              <div class="flex-1">
                <div class="text-sm" :class="n.read ? 'opacity-60' : ''">{{ n.text }}</div>
                <div class="text-xs text-[var(--content-muted)]">{{ fmt(n.timestamp) }}</div>
              </div>
              <button class="text-xs hocus:text-[var(--accent)]" @click="markRead(n.id)" v-if="!n.read">Mark read</button>
            </div>
          </li>
        </ul>
        <EmptyState v-if="!list.length">
          <template #title>No notifications</template>
          <template #desc>You're all caught up.</template>
        </EmptyState>
      </div>

      <aside class="space-y-4">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
          <h3 class="font-medium">Email & Digest Preferences</h3>
          <div class="text-sm flex items-center gap-2">
            <label class="text-sm">Digest</label>
            <select v-model="prefs.digest" class="rounded border border-[var(--border)] p-2 text-sm">
              <option value="off">Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <input v-model="prefs.time" type="time" class="rounded border border-[var(--border)] p-2 text-sm" />
          </div>
          <div class="text-xs text-[var(--content-muted)]">Digest schedule is per-user. Delivery is handled server-side; this is your preference.</div>
          <div class="flex items-center gap-2">
            <Button size="sm" @click="savePrefs">Save</Button>
            <Button size="sm" variant="secondary" @click="test">Send test</Button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useNotificationsStore, type NotificationType } from '@/stores/notifications'

const store = useNotificationsStore()
const types: NotificationType[] = ['review_due','approval_pending','publish_success','publish_failure','upcoming_expiry','delegation','info']
const filter = ref<NotificationType | ''>('')
const list = computed(() => store.filtered(filter.value as any))

function markRead(id: string) { store.markRead(id) }
function markAllRead() { store.markAllRead() }
function fmt(ts: number) { return new Date(ts).toLocaleString() }

const prefs = ref({ digest: store.prefs.digest, time: store.prefs.time })
function savePrefs() { store.setDigest(prefs.value.digest as any, prefs.value.time) }
function test() { store.sendTest() }
onMounted(() => store.loadPrefs())
</script>
