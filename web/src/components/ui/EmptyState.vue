<template>
  <div class="text-center p-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
    <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center">
      <slot name="icon">📄</slot>
    </div>
    <h3 class="font-semibold mb-1"><slot name="title">No Data</slot></h3>
    <p class="text-sm text-[var(--content-muted)] mb-3"><slot name="desc">Nothing to show yet.</slot></p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
</script>

