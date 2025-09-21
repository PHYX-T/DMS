import { Injectable } from '@nestjs/common'

type Role = 'EndUser'|'DocumentOwner'|'DocumentController'|'QMS'|'Admin'|'ExternalAuditor'
type QueryParams = {
  q?: string
  company?: string
  subsidiary?: string
  department?: string
  type?: string
  status?: string
  owner?: string
  review_from?: string
  review_to?: string
  retention?: string
  page?: string|number
  size?: string|number
  sort?: string
}

@Injectable()
export class SearchService {
  private cache = new Map<string, { at: number; data: any }>()
  private ttlMs = 60_000
  private engine = (process.env.SEARCH_ENGINE || 'pg').toLowerCase()

  async query(user: { role?: Role }, q: QueryParams) {
    const started = Date.now()
    const key = JSON.stringify({ userRole: user?.role || 'anon', q })
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.at < this.ttlMs) {
      return { ...cached.data, cached: true }
    }

    // Visibility filter: EndUser + ExternalAuditor → approved-only and latest_approved
    const approvedOnly = user?.role === 'EndUser' || user?.role === 'ExternalAuditor'

    let result
    if (this.engine === 'opensearch') result = await this.queryOpenSearch(q, approvedOnly)
    else result = await this.queryPgFts(q, approvedOnly)

    const elapsed_ms = Date.now() - started
    const data = { ...result, elapsed_ms }
    this.cache.set(key, { at: Date.now(), data })
    return data
  }

  // OpenSearch/Elasticsearch implementation (skeleton)
  private async queryOpenSearch(q: QueryParams, approvedOnly: boolean) {
    // Build ES DSL with filters + aggs
    // NOTE: integrate @opensearch-project/opensearch client here; env: SEARCH_URL, SEARCH_INDEX
    const filters: any[] = []
    if (q.company) filters.push({ term: { company_code: q.company } })
    if (q.subsidiary) filters.push({ term: { subsidiary_code: q.subsidiary } })
    if (q.department) filters.push({ term: { department_code: q.department } })
    if (q.type) filters.push({ term: { document_type_code: q.type } })
    if (q.status) filters.push({ term: { status: q.status } })
    if (approvedOnly) { filters.push({ term: { status: 'Approved' } }); filters.push({ term: { latest_approved: true } }) }
    if (q.owner) filters.push({ term: { owner_id: q.owner } })
    if (q.review_from || q.review_to) {
      const range: any = {}
      if (q.review_from) range.gte = q.review_from
      if (q.review_to) range.lte = q.review_to
      filters.push({ range: { review_date: range } })
    }

    const page = Math.max(1, Number(q.page || 1))
    const size = Math.min(100, Math.max(1, Number(q.size || 20)))
    const from = (page - 1) * size

    // Stub response for skeleton
    const items: any[] = []
    const total = 0
    const facets = {
      status: [], department: [], type: [], owner: [], company: [],
    }
    return { items, total, facets }
  }

  // Postgres FTS fallback (skeleton)
  private async queryPgFts(q: QueryParams, approvedOnly: boolean) {
    // Build SQL with WHERE filters, tsvector match on search_index, and aggregations for facets
    // SELECT ... FROM documents d
    // JOIN search_index s ON s.document_id = d.id
    // WHERE 1=1 AND ...
    // GROUP BY for aggregates or separate queries
    const page = Math.max(1, Number(q.page || 1))
    const size = Math.min(100, Math.max(1, Number(q.size || 20)))
    const items: any[] = []
    const total = 0
    const facets = {
      status: [], department: [], type: [], owner: [], company: [],
    }
    return { items, total, facets }
  }

  // Index pipeline stubs — call from Documents/Workflow services
  async indexDocument(doc: any) { /* Normalize, send to ES or populate FTS */ return true }
  async updateDocument(doc: any) { /* ES partial update */ return true }
  async removeDocument(docId: string) { /* Delete from index */ return true }
}
