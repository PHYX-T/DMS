<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50" @keydown.esc.prevent.stop="emit('close')">
      <div class="absolute inset-0" @click="emit('close')" aria-hidden="true"></div>
      <section role="dialog" aria-label="Notifications" aria-live="polite" class="absolute right-2 top-14 w-[min(92vw,380px)] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--content)] shadow-card p-2">
        <header class="flex items-center justify-between px-2 py-1">
          <div class="font-medium">Notifications</div>
          <div class="flex items-center gap-2">
            <select v-model="filter" class="text-xs rounded border border-[var(--border)] p-1">
              <option value="">All</option>
              <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
            </select>
            <button class="text-xs hocus:text-[var(--accent)]" @click="markAllRead">Mark all read</button>
          </div>
        </header>
        <ul class="max-h-[60vh] overflow-auto">
          <li v-for="n in list" :key="n.id" class="px-3 py-2 border-t border-[var(--border)]">
            <div class="flex items-start gap-2">
              <span class="text-xs uppercase text-[var(--content-muted)]">{{ n.type.replace('_',' ') }}</span>
              <span class="text-xs ml-auto text-[var(--content-muted)]">{{ fmt(n.timestamp) }}</span>
            </div>
            <div class="text-sm" :class="n.read ? 'opacity-60' : ''">{{ n.text }}</div>
            <div class="mt-1 flex items-center gap-2">
              <button class="text-xs hocus:text-[var(--accent)]" @click="markRead(n.id)" v-if="!n.read">Mark read</button>
              <RouterLink class="text-xs hocus:text-[var(--accent)]" :to="{ name: 'notifications' }" @click.native="emit('close')">Open center</RouterLink>
            </div>
          </li>
          <li v-if="!list.length" class="px-3 py-4 text-sm text-[var(--content-muted)]">No notifications</li>
        </ul>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useNotificationsStore, type NotificationType } from '@/stores/notifications'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e:'close'): void }>()
const store = useNotificationsStore()
const filter = ref<NotificationType | ''>('')
const types: NotificationType[] = ['review_due','approval_pending','publish_success','publish_failure','upcoming_expiry','delegation','info']
const list = computed(() => store.filtered(filter.value as any))
function markRead(id: string) { store.markRead(id) }
function markAllRead() { store.markAllRead() }
function fmt(ts: number) { return new Date(ts).toLocaleString() }

function onKeydown(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => { window.addEventListener('keydown', onKeydown) })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKeydown) })
</script>

