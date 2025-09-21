<template>
  <aside class="h-full bg-[var(--surface)] border-r border-[var(--border)] hidden sm:block">
    <nav class="p-4 text-sm">
      <ul class="space-y-2">
        <li v-for="item in items" :key="item.to"><RouterLink class="block rounded px-3 py-2 hocus:bg-[var(--muted)]" :to="item.to">{{ item.label }}</RouterLink></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const items = computed(() => {
  const common = [ { label: 'Search', to: '/search' }, { label: 'Documents', to: '/documents' } ]
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
        // Controller tools (admins can perform these)
        { label: 'Upload', to: '/controller/upload' },
        { label: 'Publish', to: '/controller/publish' },
        { label: 'Archive', to: '/controller/archive' },
        { label: 'Codes', to: '/controller/codes' },
        // Admin console
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
