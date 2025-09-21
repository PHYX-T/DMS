export type WorkflowState = 'Draft' | 'OwnerApproval' | 'Review' | 'Approved' | 'Published' | 'Rejected'
export type Transition = 'submit' | 'approve' | 'reject' | 'publish'

export function allowedTransitions(state: WorkflowState, minorPolicy: boolean): Transition[] {
  switch (state) {
    case 'Draft': return ['submit']
    case 'OwnerApproval': return ['approve','reject']
    case 'Review': return ['approve','reject']
    case 'Approved': return ['publish']
    default: return []
  }
}

export function bumpVersion(version: string, kind: 'major'|'minor'): string {
  const [maj, min] = version.split('.').map(Number)
  if (kind === 'major') return `${maj + 1}.0`
  return `${maj}.${(min || 0) + 1}`
}

export function nextStateOnSubmit(minorPolicy: boolean): WorkflowState {
  return minorPolicy ? 'OwnerApproval' : 'Review'
}

export function nextStateOnApprove(state: WorkflowState): WorkflowState {
  if (state === 'OwnerApproval' || state === 'Review') return 'Approved'
  return state
}

export function slaLabel(dueAt: number): { text: string; overdue: boolean } {
  const ms = dueAt - Date.now()
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000))
  if (ms <= 0) return { text: 'Overdue', overdue: true }
  if (days <= 1) return { text: 'Due in 1 day', overdue: false }
  return { text: `Due in ${days} days`, overdue: false }
}

