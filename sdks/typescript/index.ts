/* Auto-generated TypeScript SDK (handwritten skeleton) */
export type ErrorShape = { code: string; message: string; details?: any }
export type CreateDocument = {
  ID: string
  Title: string
  Metadata: {
    CompanyCode: string
    SubsidiaryCode: string
    DepartmentCode: string
    DocumentTypeCode: string
    IssueDate: string
    ReviewDate: string
    Keywords: string[]
    Description: string
    RetentionSchedule: { policy: 'WORM'|'STANDARD'; durationMonths: number; startDate: string }
  }
}

export class DmsClient {
  constructor(public baseUrl = '/api/v1', private token?: string) {}
  setToken(token: string) { this.token = token }
  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: any = { 'Accept': 'application/json', ...(init?.headers || {}) }
    if (!(init?.body instanceof FormData) && init?.method && init.method !== 'GET') headers['Content-Type'] = 'application/json'
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(this.baseUrl + path, { ...init, headers })
    const text = await res.text()
    const data = text ? JSON.parse(text) : {}
    if (!res.ok) throw data as ErrorShape
    return data as T
  }

  // Auth
  me() { return this.req<{ user: any }>('/auth/me') }

  // Documents
  createDocument(body: CreateDocument) { return this.req<{ id: string }>('/documents', { method: 'POST', body: JSON.stringify(body) }) }
  getDocument(id: string) { return this.req<any>(`/documents/${encodeURIComponent(id)}`) }
  listDocuments(params?: { page?: number; pageSize?: number }) {
    const q = new URLSearchParams(); if (params?.page) q.set('page', String(params.page)); if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    return this.req<{ items: any[]; total: number }>(`/documents?${q.toString()}`)
  }
  submit(id: string, minor?: boolean) { return this.req(`/documents/${encodeURIComponent(id)}/submit`, { method: 'POST', body: JSON.stringify({ minor }) }) }
  approve(id: string, comment?: string) { return this.req(`/documents/${encodeURIComponent(id)}/approve`, { method: 'POST', body: JSON.stringify({ comment }) }) }
  reject(id: string, reason?: string) { return this.req(`/documents/${encodeURIComponent(id)}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }) }
  publish(id: string, version?: string) { return this.req(`/documents/${encodeURIComponent(id)}/publish`, { method: 'POST', body: JSON.stringify({ version }) }) }
  archive(id: string, reason: string) { return this.req(`/documents/${encodeURIComponent(id)}/archive`, { method: 'POST', body: JSON.stringify({ reason }) }) }
  restore(id: string, reason: string) { return this.req(`/documents/${encodeURIComponent(id)}/restore`, { method: 'POST', body: JSON.stringify({ reason }) }) }
  history(id: string) { return this.req(`/documents/${encodeURIComponent(id)}/history`) }
  related(id: string) { return this.req(`/documents/${encodeURIComponent(id)}/related`) }
  linkRelated(id: string, action: 'link'|'unlink', relatedId: string) { return this.req(`/documents/${encodeURIComponent(id)}/related`, { method: 'POST', body: JSON.stringify({ action, relatedId }) }) }

  // Search
  search(params: Record<string, string | number | boolean | undefined>) {
    const q = new URLSearchParams()
    Object.entries(params || {}).forEach(([k,v]) => { if (v !== undefined && v !== null) q.set(k, String(v)) })
    return this.req<{ items: any[]; total: number; facets: any; elapsed_ms: number }>(`/search?${q.toString()}`)
  }

  // Reports
  kpis(params: { from?: string; to?: string; dept?: string; type?: string }) { const q = new URLSearchParams(); Object.entries(params||{}).forEach(([k,v])=>v&&q.set(k,String(v))); return this.req(`/reports/kpis?${q.toString()}`) }
  trends(params: { metric?: string; dept?: string }) { const q = new URLSearchParams(); Object.entries(params||{}).forEach(([k,v])=>v&&q.set(k,String(v))); return this.req(`/reports/trends?${q.toString()}`) }
}

