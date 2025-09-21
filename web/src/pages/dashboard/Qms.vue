<template>
  <section class="space-y-6">
    <ContentHeader>
      <template #title>QMS Overview</template>
      <template #subtitle>Compliance and currency KPIs</template>
    </ContentHeader>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <KPIStat label="Up-to-date" :value="'92%'"></KPIStat>
      <KPIStat label="Overdue" :value="8"></KPIStat>
      <KPIStat label="Approaching Review" :value="15"></KPIStat>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard class="lg:col-span-2" title="Review Trend" subtitle="Past 6 months" />
      <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
        <h3 class="font-medium mb-3">Export</h3>
        <div class="flex gap-2">
          <Button size="sm">Export PDF</Button>
          <Button size="sm" variant="secondary">Export Excel</Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ContentHeader from '@/components/layout/ContentHeader.vue'
import KPIStat from '@/components/data/KPIStat.vue'
import ChartCard from '@/components/data/ChartCard.vue'
import Button from '@/components/ui/Button.vue'
</script>

