<template>
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">{{ t('nav.documents') }}</h2>
    <form @submit.prevent class="flex gap-2">
      <label class="sr-only" for="search">{{ t('common.search') }}</label>
      <input id="search" v-model="q" class="flex-1 border rounded px-3 py-2 border-neutral-300" :placeholder="t('documents.placeholderId')" />
      <button class="px-4 py-2 rounded bg-brand-600 text-white hocus:bg-brand-700">{{ t('common.search') }}</button>
    </form>
    <VirtualList :items="items" :item-size="72" v-slot="{ item }">
      <div class="p-4 bg-white rounded shadow-card mb-3">
        <div class="font-medium">{{ item.doc_code }}</div>
        <div class="text-sm text-neutral-600">{{ item.title }}</div>
      </div>
    </VirtualList>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import VirtualList from '@/components/VirtualList.vue'

const { t } = useI18n()
const q = ref('')
// Placeholder items
const items = ref(Array.from({ length: 200 }).map((_, i) => ({ doc_code: `ABC-EU-ENG-PRO-${String(i+1).padStart(3,'0')}`, title: `Document ${i+1}` })))
</script>

