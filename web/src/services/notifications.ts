import type { NotificationType } from '@/stores/notifications'

export interface DigestPrefs { digest: 'off'|'daily'|'weekly'; time: string }
export interface NotifyPayload { type: NotificationType; text: string }

export const notificationsService = {
  async setPrefs(prefs: DigestPrefs): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 60)); return { ok: true } },
  async send(payload: NotifyPayload): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 60)); return { ok: true } },
}

