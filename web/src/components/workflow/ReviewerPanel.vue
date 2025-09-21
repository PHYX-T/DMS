<template>
  <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 e2 space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <div class="font-medium">{{ item.title }}</div>
        <div class="text-xs text-[var(--content-muted)]">{{ item.id }} · v{{ item.version }}</div>
      </div>
      <Badge :kind="sla.overdue ? 'warn' : 'info'">{{ sla.text }}</Badge>
    </div>
    <div v-if="delegateLabel" class="text-xs text-[var(--content-muted)]">{{ delegateLabel }}</div>
    <Textarea v-model="comment" rows="3" placeholder="Add a comment" />
    <div class="flex items-center gap-2">
      <Button size="sm" @click="approve">Approve</Button>
      <Button size="sm" variant="secondary" @click="reject">Reject</Button>
      <Button v-if="sla.overdue" size="sm" variant="secondary" @click="escalate">Escalate</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Badge from '@/components/ui/Badge.vue'
import type { WorkflowItem } from '@/stores/workflow'
import { useWorkflowStore } from '@/stores/workflow'
import { slaLabel } from '@/utils/workflow'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const props = defineProps<{ item: WorkflowItem }>()
const comment = ref('')
const wf = useWorkflowStore(); const auth = useAuthStore(); const toasts = useNotificationsStore()
const sla = computed(() => slaLabel(props.item.slaDueAt))
const delegateLabel = computed(() => auth.delegation ? `Acting as delegate${auth.delegation.forUserName ? ' for ' + auth.delegation.forUserName : ''}` : '')

function approve() {
  wf.approve(props.item, auth.user?.id || 'me', comment.value)
  toasts.push('Approved', 'info')
}
function reject() {
  wf.reject(props.item, auth.user?.id || 'me', comment.value)
  toasts.push('Rejected', 'warn')
}
function escalate() {
  wf.escalate(props.item, auth.user?.id || 'me')
  toasts.push('Escalated (email sent)', 'warn')
}
</script>
