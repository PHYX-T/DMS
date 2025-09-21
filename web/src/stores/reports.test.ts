import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useReportsStore } from '@/stores/reports'
import * as reports from '@/services/reports'

describe('reports store memoization', () => {
  beforeEach(() => { setActivePinia(createPinia()) })
  it('memoizes by filter key', async () => {
    const spy = vi.spyOn(reports.reportsService, 'kpis')
    const s = useReportsStore()
    const a = await s.getKPIs({ department: 'ENG' })
    const b = await s.getKPIs({ department: 'ENG' })
    expect(a).toEqual(b)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
