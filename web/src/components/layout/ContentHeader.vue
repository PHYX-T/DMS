<template>
  <div class="mb-4 flex items-start flex-wrap gap-3 justify-between">
    <div>
      <h1 class="text-2xl font-semibold leading-tight"><slot name="title">Title</slot></h1>
      <p class="text-sm text-[var(--content-muted)]"><slot name="subtitle" /></p>
    </div>
    <div class="flex items-center gap-2"><slot name="actions" /></div>
  </div>
</template>

<script setup lang="ts">
</script>

