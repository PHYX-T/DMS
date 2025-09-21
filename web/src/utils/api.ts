export const apiBase = import.meta.env.VITE_API_BASE || '/api'

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error('API Error'), { status: res.status, data })
  return data as T
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(apiBase + path, { headers: { Accept: 'application/json' } })
  return handle<T>(res)
}

export async function post<T = unknown>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(apiBase + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return handle<T>(res)
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 250): T {
  let t: any
  return ((...args: any[]) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait) }) as T
}

