import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDocumentsStore } from '@/stores/documents'

describe('documents store LRU', () => {
  beforeEach(() => { setActivePinia(createPinia()) })
  it('evicts beyond 50 items', () => {
    const s = useDocumentsStore()
    for (let i = 0; i < 55; i++) {
      const id = `DOC-${i}` as any
      s.putLRU(id, { ID: id } as any)
    }
    expect(s.byCode.size).toBe(50)
    expect(s.getCached('DOC-0' as any)).toBe(null)
  })
})

