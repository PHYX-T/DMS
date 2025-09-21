<template>
  <header class="bg-[var(--surface)] border-b border-[var(--border)]">
    <div class="container-app h-16 flex items-center gap-4">
      <button class="sm:hidden text-xl" aria-label="Menu" @click="mobileOpen = true">☰</button>
      <RouterLink to="/" class="font-semibold">DMS</RouterLink>

      <!-- Global search (navigates to /search on submit) -->
      <form class="hidden md:flex items-center flex-1 max-w-xl" @submit.prevent="goSearch">
        <input v-model="q" type="search" placeholder="Search…" class="w-full dense-input rounded-lg bg-[var(--muted)] border border-[var(--border)] px-3 py-2 text-sm" />
      </form>

      <nav class="hidden sm:flex items-center gap-2 ml-auto">
        <RouterLink class="hocus:text-[var(--accent)] text-sm" to="/search">Search</RouterLink>
        <button class="relative hocus:text-[var(--accent)] text-sm" aria-label="Open notifications" @click="trayOpen = !trayOpen">
          🔔
          <span v-if="unread>0" class="absolute -top-1 -right-2 bg-[var(--error)] text-white text-[10px] rounded-full px-1">{{ unread }}</span>
        </button>
        <RouterLink class="hocus:text-[var(--accent)] text-sm" to="/profile">Profile</RouterLink>
      </nav>
    </div>
  </header>
  <Drawer :open="mobileOpen" title="Menu" @close="mobileOpen = false">
    <nav>
      <ul class="space-y-2">
        <li><RouterLink class="block rounded px-3 py-2 hocus:bg-[var(--muted)]" to="/">Home</RouterLink></li>
        <li><RouterLink class="block rounded px-3 py-2 hocus:bg-[var(--muted)]" to="/search">Search</RouterLink></li>
        <li><RouterLink class="block rounded px-3 py-2 hocus:bg-[var(--muted)]" to="/notifications">Notifications</RouterLink></li>
        <li><RouterLink class="block rounded px-3 py-2 hocus:bg-[var(--muted)]" to="/profile">Profile</RouterLink></li>
        <template v-for="item in roleItems" :key="item.to">
          <li><RouterLink class="block rounded px-3 py-2 hocus:bg-[var(--muted)]" :to="item.to">{{ item.label }}</RouterLink></li>
        </template>
      </ul>
    </nav>
  </Drawer>
  <NotificationTray :open="trayOpen" @close="trayOpen=false" />
  
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import Drawer from '@/components/ui/Drawer.vue'
import { useAuthStore } from '@/stores/auth'
import NotificationTray from '@/components/ui/NotificationTray.vue'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const q = ref('')
function goSearch() { router.push({ name: 'search', query: q.value ? { q: q.value } : undefined }) }

const mobileOpen = ref(false)
const auth = useAuthStore()
const notify = useNotificationsStore()
const trayOpen = ref(false)
const unread = computed(() => notify.unreadCount)
const roleItems = computed(() => {
  const common = [ { label: 'Documents', to: '/documents' } ]
  switch (auth.role) {
    case 'DocumentOwner':
      return [...common, { label: 'My Submissions', to: '/owner/submissions' }, { label: 'My Reviews', to: '/owner/reviews' }]
    case 'DocumentController':
      return [...common, { label: 'Upload', to: '/controller/upload' }, { label: 'Publish', to: '/controller/publish' }, { label: 'Archive', to: '/controller/archive' }, { label: 'Codes', to: '/controller/codes' }]
    case 'QMS':
      return [...common, { label: 'Reports', to: '/qms/reports' }, { label: 'KPIs', to: '/qms/kpis' }]
    case 'Admin':
      return [
        ...common,
        { label: 'Upload', to: '/controller/upload' },
        { label: 'Publish', to: '/controller/publish' },
        { label: 'Archive', to: '/controller/archive' },
        { label: 'Codes', to: '/controller/codes' },
        { label: 'Users', to: '/admin/users' },
        { label: 'Roles', to: '/admin/roles' },
        { label: 'Settings', to: '/admin/settings' },
        { label: 'Audit', to: '/admin/audit' },
        { label: 'Backups', to: '/admin/backups' },
      ]
    case 'ExternalAuditor':
      return [...common]
    default:
      return common
  }
})
</script>
