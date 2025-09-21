<template>
  <section class="space-y-6">
    <ContentHeader>
      <template #title>Upload Document</template>
      <template #subtitle>PDF + Source, metadata, then create Draft</template>
    </ContentHeader>

    <!-- Mobile stepper -->
    <nav class="sm:hidden flex items-center justify-between text-xs">
      <button v-for="(s,i) in steps" :key="s" class="flex-1 px-2 py-2" :class="step===i ? 'text-[var(--accent)] font-medium' : 'text-[var(--content-muted)]'" @click="step=i">{{ s }}</button>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Step 1: Files -->
        <div :class="[step!==0 ? 'hidden sm:block' : 'block', 'rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2']" aria-labelledby="files-heading">
          <h3 id="files-heading" class="font-medium mb-3">Files</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">PDF</label>
              <div ref="pdfDrop" class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer" :class="pdfDrag ? 'border-[var(--accent)] bg-[var(--muted)]' : 'border-[var(--border)]'" @dragover.prevent="onDragOver('pdf')" @dragleave.prevent="onDragLeave('pdf')" @drop.prevent="onDrop('pdf', $event)" @click="pick('pdf')">
                <div v-if="!pdfFile" class="text-sm text-[var(--content-muted)]">Drag & drop PDF here or click to pick</div>
                <div v-else class="text-sm">{{ pdfFile.name }}</div>
              </div>
              <input ref="pdfInput" type="file" accept="application/pdf,image/*" capture="environment" class="hidden" @change="onPick('pdf', $event)" />
              <p class="text-xs text-[var(--content-muted)] mt-1">Accepted: PDF only</p>
              <p v-if="errors.pdf" class="text-xs text-[var(--error)] mt-1">{{ errors.pdf }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Source (optional)</label>
              <div ref="srcDrop" class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer" :class="srcDrag ? 'border-[var(--accent)] bg-[var(--muted)]' : 'border-[var(--border)]'" @dragover.prevent="onDragOver('src')" @dragleave.prevent="onDragLeave('src')" @drop.prevent="onDrop('src', $event)" @click="pick('src')">
                <div v-if="!srcFile" class="text-sm text-[var(--content-muted)]">Drag & drop Source (DOCX/MD) or click</div>
                <div v-else class="text-sm">{{ srcFile.name }}</div>
              </div>
              <input ref="srcInput" type="file" accept=".doc,.docx,.odt,.md,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" class="hidden" @change="onPick('src', $event)" />
              <p class="text-xs text-[var(--content-muted)] mt-1">Accepted: DOC, DOCX, ODT, MD</p>
              <p v-if="errors.src" class="text-xs text-[var(--error)] mt-1">{{ errors.src }}</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Metadata -->
        <div :class="[step!==1 ? 'hidden sm:block' : 'block', 'rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2']" aria-labelledby="meta-heading">
          <h3 id="meta-heading" class="font-medium mb-3">Metadata</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div ref="idField">
              <InputMaskDocId v-model="docId" label="Document ID" :hint="'Format: ABC-XY-ENG-PRO-001'" />
              <p v-if="errors.id" class="text-xs text-[var(--error)] mt-1">{{ errors.id }}</p>
              <p v-else-if="dupChecking" class="text-xs text-[var(--content-muted)]">Checking duplicates…</p>
              <p v-else-if="dupDuplicate" class="text-xs text-[var(--warn)]">Duplicate ID exists</p>
            </div>
            <div>
              <Input v-model="title" label="Title" placeholder="Short, descriptive title" />
              <p v-if="errors.title" class="text-xs text-[var(--error)] mt-1">{{ errors.title }}</p>
            </div>

            <div>
              <Combobox v-model="company" label="Company" :options="codes.companies" />
              <p v-if="errors.company" class="text-xs text-[var(--error)] mt-1">{{ errors.company }}</p>
              <p v-else-if="warnings.company" class="text-xs text-[var(--warn)] mt-1">{{ warnings.company }}</p>
            </div>
            <div>
              <Combobox v-model="subsidiary" label="Subsidiary" :options="codes.subsidiariesFor(company)" />
              <p v-if="errors.subsidiary" class="text-xs text-[var(--error)] mt-1">{{ errors.subsidiary }}</p>
              <p v-else-if="warnings.subsidiary" class="text-xs text-[var(--warn)] mt-1">{{ warnings.subsidiary }}</p>
            </div>
            <div>
              <Combobox v-model="department" label="Department" :options="codes.departmentsFor(subsidiary)" />
              <p v-if="errors.department" class="text-xs text-[var(--error)] mt-1">{{ errors.department }}</p>
              <p v-else-if="warnings.department" class="text-xs text-[var(--warn)] mt-1">{{ warnings.department }}</p>
            </div>
            <div>
              <Combobox v-model="docType" label="Type" :options="codes.types" />
              <p v-if="errors.docType" class="text-xs text-[var(--error)] mt-1">{{ errors.docType }}</p>
              <p v-else-if="warnings.docType" class="text-xs text-[var(--warn)] mt-1">{{ warnings.docType }}</p>
            </div>

            <div>
              <DatePicker v-model="issueDate" label="Issue Date" />
              <p v-if="errors.issueDate" class="text-xs text-[var(--error)] mt-1">{{ errors.issueDate }}</p>
            </div>
            <div>
              <DatePicker v-model="reviewDate" label="Review Date" />
              <p v-if="errors.reviewDate" class="text-xs text-[var(--error)] mt-1">{{ errors.reviewDate }}</p>
            </div>
            <div class="md:col-span-2">
              <Textarea v-model="description" label="Description" rows="3" />
              <p v-if="errors.description" class="text-xs text-[var(--error)] mt-1">{{ errors.description }}</p>
            </div>

            <div>
              <Select v-model="retPolicy" label="Retention Policy" :options="retentionPolicies" />
            </div>
            <div>
              <Input v-model.number="retMonths" type="number" label="Retention Months" />
              <p v-if="errors.retention" class="text-xs text-[var(--error)] mt-1">{{ errors.retention }}</p>
            </div>
          </div>
        </div>

        <!-- Step 3: Review -->
        <div :class="[step!==2 ? 'hidden sm:block' : 'block', 'rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2']">
          <h3 class="font-medium mb-3">Review</h3>
          <ul class="text-sm">
            <li><strong>ID:</strong> {{ docId }}</li>
            <li><strong>Title:</strong> {{ title }}</li>
            <li><strong>Company/Sub/Dept/Type:</strong> {{ company }}/{{ subsidiary }}/{{ department }}/{{ docType }}</li>
            <li><strong>Issue/Review:</strong> {{ issueDate }} → {{ reviewDate }}</li>
            <li><strong>Retention:</strong> {{ retPolicy }} for {{ retMonths }} months</li>
          </ul>
        </div>

        <!-- Step 4: Create -->
        <div :class="[step!==3 ? 'hidden sm:block' : 'block', 'rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2']">
          <h3 class="font-medium mb-3">Create Draft</h3>
          <div class="space-y-3">
            <Button :disabled="!canCreate || submitting" @click="submit">{{ submitting ? 'Creating…' : 'Create Draft' }}</Button>
            <Progress v-if="submitting || progress>0" :value="progress" />
          </div>
        </div>

        <!-- Mobile nav -->
        <div class="sm:hidden flex items-center justify-between sticky bottom-16 bg-[var(--surface)] p-3 border-t border-[var(--border)]">
          <Button variant="secondary" :disabled="step===0" @click="prev">Back</Button>
          <Button :disabled="!(step===3 ? canCreate : canNext)" @click="step===3 ? submit() : next()">{{ step===3 ? 'Create' : 'Next' }}</Button>
        </div>
      </div>

      <!-- Summary -->
      <aside class="space-y-4">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2" aria-live="polite">
          <h3 class="font-medium mb-2">Summary</h3>
          <p class="text-sm" :class="hasErrors ? 'text-[var(--error)]' : 'text-[var(--content-muted)]'">
            {{ errorCount }} errors, {{ warningCount }} warnings
          </p>
          <ul class="mt-2 space-y-1 text-sm" v-if="hasErrors">
            <li v-for="e in errorList" :key="e.field">• {{ e.message }}</li>
          </ul>
          <div class="mt-3 flex gap-2">
            <Button size="sm" :disabled="!hasErrors" @click="fixAll">Fix All</Button>
            <Button size="sm" variant="secondary" @click="validateAll">Re-check</Button>
          </div>
        </div>
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
          <h3 class="font-medium mb-2">Hints</h3>
          <p class="text-xs text-[var(--content-muted)]">Document ID example: <code>ABC-XY-ENG-PRO-001</code></p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Combobox from '@/components/ui/Combobox.vue'
import InputMaskDocId from '@/components/ui/InputMaskDocId.vue'
import { useCodesStore } from '@/stores/codes'
import { useDocumentsStore } from '@/stores/documents'
import { validateDocId, validateMetadata, validateRetention, validateDates, checkDuplicateId } from '@/utils/validation'
import { useNotificationsStore } from '@/stores/notifications'
import Progress from '@/components/ui/Progress.vue'

const router = useRouter()
const codes = useCodesStore()
const docs = useDocumentsStore()
const toasts = useNotificationsStore()
const retentionPolicies = [ { value: 'STANDARD', label: 'STANDARD' }, { value: 'WORM', label: 'WORM' } ]

// Stepper state
const steps = ['File','Metadata','Review','Create']
const step = ref(0)
const next = () => { if (step.value < steps.length - 1 && canNext.value) step.value++ }
const prev = () => { if (step.value > 0) step.value-- }

// Files
const pdfFile = ref<File | null>(null)
const srcFile = ref<File | null>(null)
const pdfDrag = ref(false); const srcDrag = ref(false)
const pdfInput = ref<HTMLInputElement | null>(null)
const srcInput = ref<HTMLInputElement | null>(null)
function onDragOver(which: 'pdf'|'src') { which==='pdf'? pdfDrag.value = true : srcDrag.value = true }
function onDragLeave(which: 'pdf'|'src') { which==='pdf'? pdfDrag.value = false : srcDrag.value = false }
function onDrop(which: 'pdf'|'src', e: DragEvent) {
  const f = e.dataTransfer?.files?.[0]; if (!f) return
  if (which==='pdf') setPdf(f); else setSrc(f)
}
function pick(which: 'pdf'|'src') { (which==='pdf'? pdfInput.value : srcInput.value)?.click() }
function onPick(which: 'pdf'|'src', e: Event) {
  const el = e.target as HTMLInputElement
  const f = el.files?.[0]; if (!f) return
  if (which==='pdf') setPdf(f); else setSrc(f)
  el.value = ''
}
function setPdf(f: File) {
  pdfDrag.value = false
  if (f.type !== 'application/pdf') { errors.pdf = 'Must be a PDF file'; pdfFile.value = null; return }
  pdfFile.value = f; errors.pdf = ''
}
function setSrc(f: File) {
  srcDrag.value = false
  const allowed = ['application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.oasis.opendocument.text','text/markdown']
  if (!allowed.includes(f.type) && !/\.(doc|docx|odt|md)$/i.test(f.name)) { errors.src = 'Unsupported source type'; srcFile.value = null; return }
  srcFile.value = f; errors.src = ''
}

// Metadata
const docId = ref('')
const title = ref('')
const company = ref('')
const subsidiary = ref('')
const department = ref('')
const docType = ref('')
const issueDate = ref('')
const reviewDate = ref('')
const description = ref('')
const retPolicy = ref<'WORM'|'STANDARD'>('STANDARD')
const retMonths = ref<number | undefined>(12)

// Errors/warnings
const errors = reactive<{ [k: string]: string }>({ pdf: '', src: '', id: '', title: '', company: '', subsidiary: '', department: '', docType: '', issueDate: '', reviewDate: '', description: '', retention: '' })
const warnings = reactive<{ [k: string]: string }>({})
const errorList = computed(() => Object.entries(errors).filter(([_,v]) => v).map(([field,message]) => ({ field, message })))
const errorCount = computed(() => errorList.value.length)
const warningCount = computed(() => Object.values(warnings).filter(Boolean).length)
const hasErrors = computed(() => errorCount.value > 0)
const canNext = computed(() => step.value===0 ? !!pdfFile.value : step.value===1 ? !hasErrors.value : true)
const canCreate = computed(() => !hasErrors.value && !!pdfFile.value && !!docId.value && !!title.value)

// Duplicate check
const dupChecking = ref(false)
const dupDuplicate = ref(false)
async function checkDup() {
  dupChecking.value = true
  const res = await checkDuplicateId(docId.value, async (id) => {
    await new Promise(r => setTimeout(r, 150))
    return docs.byCode.has(id)
  })
  dupChecking.value = false
  dupDuplicate.value = !res.ok
  if (!res.ok) errors.id = 'Duplicate Document ID' ; else if (!errors.id) errors.id = ''
}
watch(docId, async (v) => {
  const fmt = validateDocId(v)
  errors.id = fmt.ok ? '' : fmt.error
  if (fmt.ok) await checkDup()
})

// Field validations
watch([company, subsidiary, department, docType, issueDate, reviewDate, description, title], () => validateAll())
watch(company, (v) => { warnings.company = codes.companies.find(x => x.value === v) ? '' : (v ? 'Not in code list' : '') })
watch(subsidiary, (v) => { warnings.subsidiary = codes.subsidiariesFor(company.value).find(x => x.value === v) ? '' : (v ? 'Not in code list' : '') })
watch(department, (v) => { warnings.department = codes.departmentsFor(subsidiary.value).find(x => x.value === v) ? '' : (v ? 'Not in code list' : '') })
watch(docType, (v) => { warnings.docType = codes.types.find(x => x.value === v) ? '' : (v ? 'Not in code list' : '') })
function validateAll() {
  // Metadata object for validator
  const meta = {
    CompanyCode: company.value,
    SubsidiaryCode: subsidiary.value,
    DepartmentCode: department.value,
    DocumentTypeCode: docType.value,
    IssueDate: issueDate.value,
    ReviewDate: reviewDate.value,
    Keywords: [],
    Description: description.value,
    RetentionSchedule: { policy: retPolicy.value, durationMonths: retMonths.value ?? 0, startDate: issueDate.value },
  }
  // Required checks
  errors.title = title.value ? '' : 'Title is required'
  const m = validateMetadata(meta)
  if (!m.ok) {
    // Map generic error to field when possible
    const msg = m.error
    if (msg.includes('CompanyCode')) errors.company = 'Company is required'; else errors.company = ''
    if (msg.includes('SubsidiaryCode')) errors.subsidiary = 'Subsidiary is required'; else errors.subsidiary = ''
    if (msg.includes('DepartmentCode')) errors.department = 'Department is required'; else errors.department = ''
    if (msg.includes('DocumentTypeCode')) errors.docType = 'Type is required'; else errors.docType = ''
    if (msg.includes('IssueDate')) errors.issueDate = 'Issue date required'; else errors.issueDate = ''
    if (msg.includes('ReviewDate')) errors.reviewDate = 'Review date required'; else errors.reviewDate = ''
  } else {
    errors.company = errors.subsidiary = errors.department = errors.docType = errors.issueDate = errors.reviewDate = ''
  }
  const dates = validateDates(issueDate.value, reviewDate.value)
  if (!dates.ok) errors.reviewDate = dates.error
  const ret = validateRetention({ policy: retPolicy.value, durationMonths: retMonths.value ?? 0, startDate: issueDate.value })
  errors.retention = ret.ok ? '' : ret.error
}

// Fix All
const idField = ref<HTMLElement | null>(null)
function fixAll() {
  const targets: (HTMLElement | null)[] = [idField.value]
  const first = targets.find(Boolean)
  first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  ;(first as any)?.focus?.()
}

// Submit
async function submit() {
  validateAll()
  if (hasErrors.value) return
  // Mock create via store
  try {
    submitting.value = true
    progress.value = 5
    const timer = window.setInterval(() => { progress.value = Math.min(95, progress.value + 7) }, 120)
    await new Promise(r => setTimeout(r, 600))
    window.clearInterval(timer)
    progress.value = 100
    try { const { useTelemetryStore } = await import('@/stores/telemetry'); useTelemetryStore().trackAction('create_draft', { id: docId.value }) } catch {}
    toasts.push('Draft created. Next: send for review.', 'info')
    router.push({ name: 'document.view', params: { id: docId.value } })
  } catch {
    toasts.push('Create failed', 'error')
  } finally { submitting.value = false; progress.value = 0 }
}

onMounted(() => { codes.refresh() })
// submit progress state
const submitting = ref(false)
const progress = ref(0)
</script>
