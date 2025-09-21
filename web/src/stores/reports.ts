import { defineStore } from 'pinia'
import type { KPIFilters, KPIResponse } from '@/services/reports'
import { reportsService } from '@/services/reports'

function keyOf(f: KPIFilters) {
  return JSON.stringify({ from: f.from || '', to: f.to || '', department: f.department || '', type: f.type || '' })
}

export const useReportsStore = defineStore('reports', {
  state: () => ({ cache: new Map<string, KPIResponse>(), loadingKeys: new Set<string>() }),
  actions: {
    async getKPIs(filters: KPIFilters): Promise<KPIResponse> {
      const key = keyOf(filters)
      const cached = this.cache.get(key)
      if (cached) return cached
      if (this.loadingKeys.has(key)) {
        // simple spin-wait for demo; in real impl, use promise map
        await new Promise(r => setTimeout(r, 100))
        const again = this.cache.get(key)
        if (again) return again
      }
      this.loadingKeys.add(key)
      try {
        const resp = await reportsService.kpis(filters)
        this.cache.set(key, resp)
        return resp
      } finally {
        this.loadingKeys.delete(key)
      }
    },
  },
})
