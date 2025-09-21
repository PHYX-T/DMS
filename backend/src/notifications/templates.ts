export function renderTemplate(type: string, payload: any): { subject: string; text: string } {
  switch (type) {
    case 'review_assigned':
      return { subject: `Review assigned: ${payload?.title || ''}`, text: `A document requires your review: ${payload?.title}. SLA due ${payload?.sla || ''}.` }
    case 'approval_pending':
      return { subject: `Approval pending: ${payload?.title || ''}`, text: `Approval is pending for: ${payload?.title}.` }
    case 'publish_success':
      return { subject: `Published: ${payload?.title || ''}`, text: `Document has been published successfully.` }
    case 'publish_failure':
      return { subject: `Publish failed: ${payload?.title || ''}`, text: `Publish failed. Error: ${payload?.error || ''}` }
    case 'upcoming_expiry':
      return { subject: `Upcoming review date: ${payload?.title || ''}`, text: `Review date approaching on ${payload?.date || ''}.` }
    case 'delegation_start':
      return { subject: `Delegation started`, text: `You are now acting as ${payload?.role} for ${payload?.forUserName || ''} until ${payload?.endsAt || ''}.` }
    case 'delegation_end':
      return { subject: `Delegation ended`, text: `Your delegation has ended.` }
    default:
      return { subject: 'Notification', text: 'You have a new notification.' }
  }
}

