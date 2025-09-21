<template>
  <nav class="fixed inset-x-0 bottom-0 bg-[var(--surface)] border-t border-[var(--border)] sm:hidden">
    <ul class="flex items-stretch text-sm">
      <li class="flex-1"><RouterLink class="block text-center py-3" to="/">Home</RouterLink></li>
      <li class="flex-1"><RouterLink class="block text-center py-3" to="/search">Search</RouterLink></li>
      <li class="flex-1"><RouterLink class="block text-center py-3" to="/notifications">Alerts</RouterLink></li>
      <li class="flex-1"><RouterLink class="block text-center py-3" to="/profile">Profile</RouterLink></li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
