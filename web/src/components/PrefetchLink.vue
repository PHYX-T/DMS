<template>
  <RouterLink v-bind="$attrs" :to="to" @mouseenter.passive="prefetch" @focus.passive="prefetch"><slot /></RouterLink>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
const props = defineProps<{ to: string | Record<string, any> }>()
const router = useRouter()

async function prefetch() {
  const r = router.resolve(props.to)
  for (const m of r.matched) {
    const preload = m.meta && (m.meta as any).preload
    if (typeof preload === 'function') try { await preload() } catch { /* ignore */ }
  }
}
</script>

