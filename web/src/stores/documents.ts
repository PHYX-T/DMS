import { defineStore } from 'pinia'
import type { Document as Doc, DocumentID } from '@/types/strict'
import { get, post } from '@/utils/api'

export const useDocumentsStore = defineStore('documents', {
  state: () => ({ byCode: new Map<string, Doc>(), order: [] as string[], loading: false, error: '' as string | null }),
  actions: {
    // LRU helpers
    putLRU(id: DocumentID, doc: Doc) {
      this.byCode.set(id, doc)
      const i = this.order.indexOf(id)
      if (i >= 0) this.order.splice(i, 1)
      this.order.unshift(id)
      if (this.order.length > 50) {
        const evict = this.order.pop() as string
        this.byCode.delete(evict)
      }
    },
    getCached(id: DocumentID) { return this.byCode.get(id) || null },

    async fetchByCode(code: string) {
      this.loading = true; this.error = ''
      try {
        // Replace with service/documents when wiring API
        const d = await get<Doc | any>(`/documents?code=${encodeURIComponent(code)}`)
        this.putLRU(code as any, d as any)
        return d
      } catch (e: any) { this.error = e?.data?.error || 'Fetch failed'; throw e } finally { this.loading = false }
    },
    async create(payload: any) {
      this.loading = true; this.error = ''
      try { return await post('/documents', payload) } catch (e: any) { this.error = e?.data?.error || 'Create failed'; throw e } finally { this.loading = false }
    },
  },
})
