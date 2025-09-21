import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'

describe('notifications store', () => {
  beforeEach(() => { setActivePinia(createPinia()) })
  it('unread counts and mark all read', () => {
    const s = useNotificationsStore()
    s.pushType('review_due', 'Review due soon')
    s.pushType('approval_pending', 'Approval pending')
    expect(s.unreadCount).toBe(2)
    s.markAllRead()
    expect(s.unreadCount).toBe(0)
  })
})

