<template>
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">{{ t('nav.upload') }}</h2>
    <form @submit.prevent="submit" class="grid grid-cols-1 md:grid-cols-2 gap-4" aria-describedby="help">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium" for="doc_id">{{ t('documents.id') }}</label>
        <input id="doc_id" :value="docId" readonly class="mt-1 w-full border rounded px-3 py-2 bg-neutral-50 border-neutral-300" aria-describedby="id-help" />
        <p id="id-help" class="text-xs text-neutral-600 mt-1">{{ t('guides.id') }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium" for="company">{{ t('documents.company') }}</label>
        <select id="company" v-model="company" class="mt-1 w-full border rounded px-3 py-2 border-neutral-300">
          <option v-for="c in codes.companies" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium" for="subsidiary">{{ t('documents.subsidiary') }}</label>
        <select id="subsidiary" v-model="subsidiary" class="mt-1 w-full border rounded px-3 py-2 border-neutral-300">
          <option v-for="s in subs" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium" for="department">{{ t('documents.department') }}</label>
        <select id="department" v-model="department" class="mt-1 w-full border rounded px-3 py-2 border-neutral-300">
          <option v-for="d in deps" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium" for="type">{{ t('documents.type') }}</label>
        <select id="type" v-model="type" class="mt-1 w-full border rounded px-3 py-2 border-neutral-300">
          <option v-for="t in codes.types" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium" for="sequence">{{ t('documents.sequence') }}</label>
        <input id="sequence" v-model="sequence" inputmode="numeric" pattern="\\d{3}" class="mt-1 w-full border rounded px-3 py-2 border-neutral-300" placeholder="001" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium" for="title">{{ t('documents.title') }}</label>
        <input id="title" v-model="title" class="mt-1 w-full border rounded px-3 py-2 border-neutral-300" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium" for="keywords">{{ t('documents.keywords') }}</label>
        <input id="keywords" v-model="keywords" class="mt-1 w-full border rounded px-3 py-2 border-neutral-300" placeholder="iso,qms" />
      </div>
      <div class="md:col-span-2 flex items-center gap-3">
        <button class="ml-auto px-4 py-2 rounded bg-brand-600 text-white hocus:bg-brand-700">{{ t('common.create') }}</button>
      </div>
      <p id="help" class="text-xs text-neutral-600 md:col-span-2">{{ t('guides.sequence') }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCodesStore } from '@/stores/codes'
import { post } from '@/utils/api'

const { t } = useI18n()
const codes = useCodesStore()

const company = ref('ABC')
const subsidiary = ref('HQ')
const department = ref('ENG')
const type = ref('PRO')
const sequence = ref('001')
const title = ref('')
const keywords = ref('')

const subs = computed(() => codes.subsidiariesFor(company.value))
const deps = computed(() => codes.departmentsFor(subsidiary.value))
const docId = computed(() => `${company.value}-${subsidiary.value}-${department.value}-${type.value}-${(sequence.value||'').padStart(3,'0').slice(-3)}`)

async function submit() {
  const payload: any = {
    doc_code: docId.value,
    title: title.value,
    company_code: company.value,
    subsidiary_code: subsidiary.value,
    department_code: department.value,
    document_type_code: type.value,
  }
  const ks = keywords.value.split(',').map(k=>k.trim()).filter(Boolean)
  if (ks.length) payload.keywords = ks
  try { await post('/documents', payload); alert('Created') } catch (e) { alert('Failed') }
}

codes.refresh()
</script>

