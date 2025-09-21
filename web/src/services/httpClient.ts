import type { ApiError, RetryPolicy, HttpMethod } from './types'
import { useAuthStore } from '@/stores/auth'

const apiBase = import.meta.env.VITE_API_BASE || '/api'

const defaultRetry: RetryPolicy = { retries: 3, baseDelayMs: 300, maxDelayMs: 4000, retryOn: [429, 502, 503, 504] }

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

async function request<T>(method: HttpMethod, path: string, body?: unknown, opts?: { signal?: AbortSignal; headers?: Record<string, string>; retry?: RetryPolicy }): Promise<T> {
  const auth = useAuthStore()
  const url = apiBase + path
  const retry = opts?.retry || defaultRetry
  const headers: Record<string, string> = { Accept: 'application/json', ...(opts?.headers || {}) }
  if (!(body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`

  let attempt = 0
  const retryOn = retry.retryOn || defaultRetry.retryOn!
  while (true) {
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body instanceof FormData ? (body as any) : body != null ? JSON.stringify(body) : undefined,
        signal: opts?.signal,
      })

      if (!res.ok) {
        if (retryOn.includes(res.status) && attempt < retry.retries) {
          const retryAfter = Number(res.headers.get('retry-after'))
          const backoff = Math.min(retry.maxDelayMs || 4000, retry.baseDelayMs * Math.pow(2, attempt))
          await sleep((retryAfter && !Number.isNaN(retryAfter) ? retryAfter * 1000 : backoff))
          attempt++
          continue
        }
        const data = await res.json().catch(() => ({}))
        const err = Object.assign(new Error('API Error'), { status: res.status, data }) as ApiError
        throw err
      }
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) return (await res.json()) as T
      // Fallback to text
      return (await res.text()) as unknown as T
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e
      if (attempt < retry.retries) {
        await sleep(Math.min(retry.maxDelayMs || 4000, retry.baseDelayMs * Math.pow(2, attempt)))
        attempt++
        continue
      }
      throw e
    }
  }
}

export const httpClient = {
  get: <T>(path: string, opts?: { signal?: AbortSignal; headers?: Record<string, string>; retry?: RetryPolicy }) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: { signal?: AbortSignal; headers?: Record<string, string>; retry?: RetryPolicy }) => request<T>('POST', path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: { signal?: AbortSignal; headers?: Record<string, string>; retry?: RetryPolicy }) => request<T>('PUT', path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: { signal?: AbortSignal; headers?: Record<string, string>; retry?: RetryPolicy }) => request<T>('PATCH', path, body, opts),
  delete: <T>(path: string, opts?: { signal?: AbortSignal; headers?: Record<string, string>; retry?: RetryPolicy }) => request<T>('DELETE', path, undefined, opts),
}

