import { defineStore } from 'pinia'

export interface OfflineTask { id: string; name: string; payload: Record<string, unknown> }

export const useOfflineStore = defineStore('offline', {
  state: () => ({ queue: [] as OfflineTask[] }),
  actions: {
    add(name: string, payload: Record<string, unknown>) { this.queue.push({ id: String(Date.now()), name, payload }) },
    clear() { this.queue = [] },
    async flush(run: (t: OfflineTask) => Promise<void>) {
      const pending = [...this.queue]
      for (const t of pending) {
        try { await run(t); this.queue = this.queue.filter(x => x.id !== t.id) } catch { /* keep */ }
      }
    },
  },
})

