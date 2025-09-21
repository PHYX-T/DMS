<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold">Document Management & Control</h1>
    <p class="text-neutral-700">ISO/GDPR-aligned workflows with auditable controls.</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RouterLink class="block p-6 rounded-lg bg-white shadow-card hocus:ring-2 ring-brand-500" to="/documents">
        <div class="font-medium mb-1">{{ t('nav.documents') }}</div>
        <div class="text-sm text-neutral-600">Search and view documents.</div>
      </RouterLink>
      <RouterLink class="block p-6 rounded-lg bg-white shadow-card hocus:ring-2 ring-brand-500" to="/upload">
        <div class="font-medium mb-1">{{ t('nav.upload') }}</div>
        <div class="text-sm text-neutral-600">Create new controlled documents.</div>
      </RouterLink>
      <RouterLink class="block p-6 rounded-lg bg-white shadow-card hocus:ring-2 ring-brand-500" to="/reports">
        <div class="font-medium mb-1">{{ t('nav.reports') }}</div>
        <div class="text-sm text-neutral-600">KPIs and audit reports.</div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

