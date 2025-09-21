<template>
  <div class="space-y-4">
    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
      <h3 class="font-medium mb-3">What changed?</h3>
      <Textarea v-model="changes" rows="3" placeholder="Summarize the changes" />
    </div>
    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
      <h3 class="font-medium mb-3">Rationale</h3>
      <Textarea v-model="rationale" rows="3" placeholder="Why this change is needed" />
    </div>
    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
      <h3 class="font-medium mb-3">Attachments</h3>
      <input type="file" multiple />
    </div>
    <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2">
      <h3 class="font-medium mb-3">Preview Diffs</h3>
      <div class="text-sm text-[var(--content-muted)]">Metadata and highlights preview (stub)</div>
      <Skeleton class="h-24 mt-2" />
    </div>
    <div class="flex items-center gap-2">
      <Button :disabled="!changes || !rationale" @click="submit">Submit for Review</Button>
      <span class="text-xs text-[var(--content-muted)]">Policy: {{ minorPolicy ? 'Minor (OwnerApproval)' : 'Major (Review)' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import type { WorkflowItem } from '@/stores/workflow'
import { useWorkflowStore } from '@/stores/workflow'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ item: WorkflowItem }>()
const changes = ref('')
const rationale = ref('')
const minorPolicy = props.item.minorPolicy
const wf = useWorkflowStore(); const auth = useAuthStore(); const toasts = useNotificationsStore()

function submit() {
  wf.submitDraft(props.item, auth.user?.id || 'me', `${changes.value} — ${rationale.value}`)
  toasts.push('Submitted for review', 'info')
}
</script>

