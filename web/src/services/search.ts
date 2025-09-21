import type { SearchQuery, SearchResponse, Facet } from './types'
import type { Document as Doc } from '@/types/strict'

type Result = Pick<Doc, 'ID'|'Title'|'Status'|'Version'|'Owner'|'Controller'> & { Updated: string }

export const searchService = {
  async search(q: SearchQuery, opts?: { signal?: AbortSignal }): Promise<SearchResponse<Result>> {
    await new Promise(r => setTimeout(r, 150))
    // mock response respecting query shape
    const items: Result[] = q.text ? [ { ID: 'ABC-XY-ENG-PRO-001' as any, Title: 'Quality Policy', Status: 'Approved', Version: '3.2', Owner: 'u1', Controller: 'u2', Updated: '2025-09-01' } ] : []
    const facets: Facet[] = [
      { field: 'DepartmentCode', buckets: [ { key: 'ENG', count: 12 }, { key: 'QMS', count: 8 } ] },
      { field: 'DocumentTypeCode', buckets: [ { key: 'PRO', count: 20 }, { key: 'POL', count: 6 } ] },
    ]
    return { items, total: items.length, facets }
  },
}

