import { httpClient } from './httpClient'

export interface Credentials { email: string; password: string }
export interface Session { token: string; user: { id: string; name: string; email: string; role: string } }
export interface AuthError { status: number; message: string }

export const authService = {
  async login(creds: Credentials, opts?: { signal?: AbortSignal }): Promise<Session> {
    // mock adapter
    await new Promise(r => setTimeout(r, 150))
    return { token: 'mock-token', user: { id: 'u:' + creds.email, name: creds.email.split('@')[0], email: creds.email, role: 'EndUser' } }
  },
  async refresh(opts?: { signal?: AbortSignal }): Promise<Pick<Session, 'token'>> {
    await new Promise(r => setTimeout(r, 50)); return { token: 'mock-token' }
  },
  async logout(): Promise<void> { await new Promise(r => setTimeout(r, 10)) },
}

