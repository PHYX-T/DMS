import { defineStore } from 'pinia'

export interface CodeOption { value: string; label: string }

interface State {
  companies: CodeOption[]
  subsidiaries: CodeOption[]
  departments: CodeOption[]
  types: CodeOption[]
  relations: { companiesToSubsidiaries: Record<string,string[]>; subsidiariesToDepartments: Record<string,string[]> }
  proposals: {
    companies: CodeOption[]
    subsidiaries: CodeOption[]
    departments: CodeOption[]
    types: CodeOption[]
  }
  usage: Record<string, number>
  meta: Record<string, { etag?: string | null; updatedAt?: number | null; loading?: boolean; error?: string | null }>
}

export const useCodesStore = defineStore('codes', {
  state: (): State => ({
    companies: [ { value: 'ABC', label: 'ABC — Acme Base Company' } ],
    subsidiaries: [ { value: 'HQ', label: 'HQ — Headquarters' }, { value: 'EU', label: 'EU — Europe' }, { value: 'US', label: 'US — United States' } ],
    departments: [ { value: 'ENG', label: 'ENG — Engineering' }, { value: 'OPS', label: 'OPS — Operations' }, { value: 'QMS', label: 'QMS — Quality Management' } ],
    types: [ { value: 'PRO', label: 'PRO — Procedure' }, { value: 'POL', label: 'POL — Policy' }, { value: 'WRK', label: 'WRK — Work Instruction' } ],
    relations: {
      companiesToSubsidiaries: { ABC: ['HQ','EU','US'] },
      subsidiariesToDepartments: { HQ: ['ENG','OPS','QMS'], EU: ['ENG','QMS'], US: ['OPS','QMS'] },
    },
    proposals: { companies: [], subsidiaries: [], departments: [], types: [] },
    usage: { 'ABC': 12, 'HQ': 20, 'ENG': 15, 'PRO': 30 },
    meta: { companies: {}, subsidiaries: {}, departments: {}, types: {} } as any,
  }),
  getters: {
    subsidiariesFor: (s) => (company?: string) => {
      if (!company) return s.subsidiaries
      const allow = s.relations.companiesToSubsidiaries[company]
      return allow ? s.subsidiaries.filter(x => allow.includes(x.value)) : s.subsidiaries
    },
    departmentsFor: (s) => (subsidiary?: string) => {
      if (!subsidiary) return s.departments
      const allow = s.relations.subsidiariesToDepartments[subsidiary]
      return allow ? s.departments.filter(x => allow.includes(x.value)) : s.departments
    },
  },
  actions: {
    // Selectors
    list(kind: 'companies'|'subsidiaries'|'departments'|'types') { return (this as any)[kind] as CodeOption[] },
    isStale(kind: 'companies'|'subsidiaries'|'departments'|'types', maxAgeMs = 24*60*60*1000) {
      const m = this.meta[kind] || {}
      return !m.updatedAt || (Date.now() - (m.updatedAt || 0)) > maxAgeMs
    },

    // CRUD helpers (mocked)
    propose(kind: 'companies'|'subsidiaries'|'departments'|'types', code: CodeOption) {
      if (!this.proposals[kind].some(c => c.value === code.value)) this.proposals[kind].push(code)
    },
    approve(kind: 'companies'|'subsidiaries'|'departments'|'types', value: string) {
      const idx = this.proposals[kind].findIndex(c => c.value === value)
      if (idx >= 0) {
        const code = this.proposals[kind][idx]
        this[kind].push(code as any)
        this.proposals[kind].splice(idx, 1)
      }
    },
    reject(kind: 'companies'|'subsidiaries'|'departments'|'types', value: string) {
      this.proposals[kind] = this.proposals[kind].filter(c => c.value !== value)
    },
    remove(kind: 'companies'|'subsidiaries'|'departments'|'types', value: string) {
      this[kind] = (this[kind] as CodeOption[]).filter(c => c.value !== value) as any
    },
    upsert(kind: 'companies'|'subsidiaries'|'departments'|'types', code: CodeOption) {
      const list = this[kind] as CodeOption[]
      const i = list.findIndex(c => c.value === code.value)
      if (i >= 0) list[i] = code; else list.push(code)
    },
    usageCount(code: string) { return this.usage[code] || 0 },

    // CSV import/export (mock)
    exportCSV(kind: 'companies'|'subsidiaries'|'departments'|'types'): string {
      const list = this[kind] as CodeOption[]
      const rows = [['value','label'], ...list.map(c => [c.value, c.label])]
      return rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n')
    },
    importCSV(kind: 'companies'|'subsidiaries'|'departments'|'types', csv: string): { ok: boolean; errors: string[] } {
      const errors: string[] = []
      const lines = csv.split(/\r?\n/).filter(Boolean)
      const header = lines.shift()?.toLowerCase()
      if (!header || !header.includes('value') || !header.includes('label')) return { ok: false, errors: ['Missing header value,label'] }
      for (const line of lines) {
        const m = line.match(/\s*"([^"]*)"\s*,\s*"([^"]*)"\s*/)
        if (!m) { errors.push(`Invalid row: ${line}`); continue }
        const value = m[1].trim().toUpperCase(); const label = m[2].trim()
        if (!value) { errors.push('Empty value'); continue }
        // Inline validation: companies/departments/types length 3, subsidiary length 2
        const len = kind === 'subsidiaries' ? 2 : 3
        if (value.length !== len) { errors.push(`Value ${value} must be ${len} characters`) ; continue }
        if ((this[kind] as CodeOption[]).some(c => c.value === value)) { errors.push(`Duplicate ${value}`); continue }
        ;(this[kind] as CodeOption[]).push({ value, label })
      }
      return { ok: errors.length === 0, errors }
    },
    // SWR + ETag aware refresh per endpoint
    async refresh(kind?: 'companies'|'subsidiaries'|'departments'|'types') {
      const kinds: any[] = kind ? [kind] : ['companies','subsidiaries','departments','types']
      const base = (import.meta.env.VITE_API_BASE || '/api')
      for (const k of kinds) {
        const meta = this.meta[k] || (this.meta[k] = {})
        meta.loading = true; meta.error = null
        try {
          const headers: Record<string, string> = {}
          if (meta.etag) headers['If-None-Match'] = meta.etag
          const res = await fetch(`${base}/codes/${k}`, { headers })
          if (res.status === 304) { meta.loading = false; continue }
          if (!res.ok) throw new Error(String(res.status))
          const data = await res.json().catch(()=>({ list: [] }))
          const etag = res.headers.get('etag')
          if (etag) meta.etag = etag
          ;(this as any)[k] = data.list || data || (this as any)[k]
          meta.updatedAt = Date.now(); meta.loading = false
        } catch (e: any) {
          meta.loading = false; meta.error = e?.message || 'Failed to load'
        }
      }
      return true
    },
  },
})
