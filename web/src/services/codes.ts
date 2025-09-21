import type { CodeOption } from '@/stores/codes'

export const codesService = {
  async list(kind: 'companies'|'subsidiaries'|'departments'|'types'): Promise<CodeOption[]> {
    await new Promise(r => setTimeout(r, 80))
    return []
  },
  async propose(kind: 'companies'|'subsidiaries'|'departments'|'types', code: CodeOption): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 80)); return { ok: true } },
  async approve(kind: 'companies'|'subsidiaries'|'departments'|'types', value: string): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 80)); return { ok: true } },
  async reject(kind: 'companies'|'subsidiaries'|'departments'|'types', value: string): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 80)); return { ok: true } },
}

