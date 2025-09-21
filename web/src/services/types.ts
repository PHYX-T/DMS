export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiError extends Error {
  status: number
  code?: string
  data?: unknown
}

export interface RetryPolicy {
  retries: number
  baseDelayMs: number
  maxDelayMs?: number
  retryOn?: number[] // HTTP status codes to retry on (default: [429, 502, 503, 504])
}

export interface Page<T> {
  items: T[]
  total: number
}

export interface PagingRequest {
  page?: number
  pageSize?: number
}

export type SortOrder = 'asc' | 'desc'
export interface SortParam { field: string; order: SortOrder }

export interface FacetBucket { key: string; count: number }
export interface Facet { field: string; buckets: FacetBucket[] }

export interface SearchQuery {
  text?: string
  filters?: Partial<{
    CompanyCode: string
    SubsidiaryCode: string
    DepartmentCode: string
    DocumentTypeCode: string
    Status: string
    Owner: string
    ReviewFrom: string
    ReviewTo: string
    Keywords: string
    RetentionPolicy: string
    RetentionMonths: number
  }>
  paging?: PagingRequest
  sort?: SortParam
}

export interface SearchResponse<T> extends Page<T> {
  facets: Facet[]
}

