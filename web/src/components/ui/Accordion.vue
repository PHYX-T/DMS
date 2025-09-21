<template>
  <details class="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
    <summary class="list-none cursor-pointer select-none px-4 py-3 font-medium flex items-center justify-between">
      <span><slot name="summary" /></span>
      <span aria-hidden="true">▾</span>
    </summary>
    <div class="px-4 pb-4 -mt-1"><slot /></div>
  </details>
</template>

<script setup lang="ts">
</script>

