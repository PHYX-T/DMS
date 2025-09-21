<template>
  <section class="space-y-6">
    <ContentHeader>
      <template #title>Admin Dashboard</template>
      <template #subtitle>System health and admin KPIs</template>
    </ContentHeader>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <KPIStat label="Users" :value="128"></KPIStat>
      <KPIStat label="Docs" :value="2048"></KPIStat>
      <KPIStat label="Storage" :value="'76%'"></KPIStat>
      <KPIStat label="Jobs" :value="'OK'" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">System Health</h3>
        <ul class="text-sm space-y-1">
          <li>Indexing: <Badge kind="ok">Healthy</Badge></li>
          <li>Storage: <Badge kind="info">76% used</Badge></li>
          <li>Job Runners: <Badge kind="ok">All passing</Badge></li>
        </ul>
      </div>
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Users by Role</h3>
        <ul class="text-sm space-y-1">
          <li>EndUser: 80</li>
          <li>Owner: 20</li>
          <li>Controller: 10</li>
          <li>QMS: 10</li>
          <li>Admin: 8</li>
        </ul>
      </div>
      <div class="space-y-4">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <h3 class="font-medium mb-3">SSO</h3>
          <div class="text-sm">Status: <Badge kind="ok">Connected</Badge></div>
        </div>
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <h3 class="font-medium mb-3">Backups</h3>
          <div class="text-sm">Last Snapshot: <span class="text-[var(--content-muted)]">2025-09-10 03:00 UTC</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ContentHeader from '@/components/layout/ContentHeader.vue'
import KPIStat from '@/components/data/KPIStat.vue'
import Badge from '@/components/ui/Badge.vue'
</script>

