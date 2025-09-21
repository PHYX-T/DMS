import { NotificationsService } from '../src/notifications/notifications.service.js'

describe('NotificationsService', () => {
  it('triggers and lists notifications', async () => {
    const svc = new NotificationsService({ send: async () => true } as any, { append: async () => ({}) } as any)
    await svc.setPrefs('user', { digest: 'off' })
    await svc.trigger('approval_pending', 'user', { title: 'Test' })
    const list = await svc.list('user')
    expect(list.length).toBeGreaterThan(0)
  })
})

