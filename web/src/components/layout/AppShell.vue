<template>
  <div class="min-h-screen bg-[var(--bg)] text-[var(--content)]" :class="{ 'pl-56': sidebar }">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1 text-sm">Skip to content</a>
    <TopNav />
    <SideNav v-if="sidebar" class="fixed inset-y-0 left-0 w-56" />
    <main id="main" class="container-app py-6">
      <slot />
    </main>
    <BottomBar class="sm:hidden" />
  </div>
</template>

<script setup lang="ts">
import TopNav from './TopNav.vue'
import SideNav from './SideNav.vue'
import BottomBar from './BottomBar.vue'
withDefaults(defineProps<{ sidebar?: boolean }>(), { sidebar: true })
</script>
