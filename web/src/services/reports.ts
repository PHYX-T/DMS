export interface KPIFilters { from?: string; to?: string; department?: string; type?: string }
export interface KPIResponse { pending: number; overdue: number; approaching: number; approvedPct: number }

export const reportsService = {
  async kpis(filters: KPIFilters): Promise<KPIResponse> { await new Promise(r => setTimeout(r, 120)); return { pending: 7, overdue: 2, approaching: 5, approvedPct: 92 } },
  async export(format: 'pdf'|'xlsx', filters: KPIFilters): Promise<Blob> { await new Promise(r => setTimeout(r, 100)); return new Blob(['stub'], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) },
}

