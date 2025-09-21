import { Injectable } from '@nestjs/common'

type KPIFilters = { from?: string; to?: string; dept?: string; type?: string }

@Injectable()
export class ReportsService {
  private cache = new Map<string, { at: number; data: any }>()
  private ttlMs = 5 * 60_000 // 5 minutes

  async kpis(filters: KPIFilters) {
    const key = 'kpis:' + JSON.stringify(filters)
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.at < this.ttlMs) return cached.data

    // Optimized SQL (indicative; use a query builder/ORM):
    // WITH filtered AS (
    //   SELECT d.* FROM documents d
    //   WHERE (d.review_date BETWEEN $1 AND $2) AND ($3 IS NULL OR d.department_code=$3) AND ($4 IS NULL OR d.type_code=$4)
    // )
    // SELECT
    //   ROUND(100.0 * SUM(CASE WHEN status='Approved' OR status='Published' THEN 1 ELSE 0 END)/COUNT(*), 2) AS latest_approved_pct,
    //   SUM(CASE WHEN status='Review' OR status='OwnerApproval' THEN 1 ELSE 0 END) AS pending_review,
    //   SUM(CASE WHEN status!='Approved' AND status!='Published' AND review_date < now()::date THEN 1 ELSE 0 END) AS overdue_review,
    //   SUM(CASE WHEN status!='Approved' AND status!='Published' AND review_date >= now()::date AND review_date < (now()::date + INTERVAL '14 days') THEN 1 ELSE 0 END) AS approaching_review,
    //   AVG(EXTRACT(day FROM (review_date - issue_date))) AS avg_cycle_time_days
    // FROM filtered;

    // Stub response (replace with real DB call):
    const data = { latestApprovedPct: 92, pendingReview: 7, overdueReview: 2, approachingReview: 5, avgCycleTimeDays: 12 }
    this.cache.set(key, { at: Date.now(), data })
    return data
  }

  async trends(filters: { metric: string; dept?: string }) {
    // SQL example for cycle time by month/department:
    // SELECT to_char(issue_date, 'YYYY-MM') AS period, department_code AS dept,
    //   AVG(EXTRACT(day FROM (review_date - issue_date))) AS cycle_time
    // FROM documents
    // WHERE ...
    // GROUP BY 1,2 ORDER BY 1 DESC;
    const now = new Date()
    const iso = (d: Date) => d.toISOString().slice(0,7)
    const series = [0,1,2,3,4,5].map((m) => {
      const d = new Date(now); d.setMonth(d.getMonth()-m)
      return { period: iso(d), dept: filters.dept || 'ALL', value: 10 + (m % 3) }
    }).reverse()
    return { series }
  }

  async export(body: { format: 'pdf'|'xlsx'; from?: string; to?: string; dept?: string; type?: string }) {
    const jobId = 'job_' + Date.now()
    // Enqueue export job (stub) and return link (stub)
    const link = `/downloads/${jobId}.${body.format}`
    return { jobId, link }
  }
}

