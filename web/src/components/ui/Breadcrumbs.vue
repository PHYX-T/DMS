<template>
  <nav aria-label="Breadcrumb" class="text-sm">
    <ol class="flex items-center gap-2 text-[var(--content-muted)]">
      <li v-for="(item,i) in items" :key="i" class="inline-flex items-center gap-2">
        <RouterLink v-if="i < items.length -1" :to="item.to" class="hocus:text-[var(--content)]">{{ item.label }}</RouterLink>
        <span v-else aria-current="page" class="text-[var(--content)] font-medium">{{ item.label }}</span>
        <span v-if="i < items.length -1" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
defineProps<{ items: { label: string; to?: any }[] }>()
</script>

