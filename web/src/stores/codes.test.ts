import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCodesStore } from '@/stores/codes'

describe('codes store actions', () => {
  beforeEach(() => { setActivePinia(createPinia()) })
  it('propose then approve moves to active', () => {
    const s = useCodesStore()
    s.propose('departments', { value: 'FIN', label: 'Finance' })
    expect((s.proposals.departments || []).find(p => p.value === 'FIN')).toBeTruthy()
    s.approve('departments', 'FIN')
    expect(s.departments.find(d => d.value === 'FIN')).toBeTruthy()
    expect(s.proposals.departments.find(p => p.value === 'FIN')).toBeFalsy()
  })
})

