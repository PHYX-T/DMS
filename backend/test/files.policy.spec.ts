import { describe, it, expect } from '@jest/globals'
import { FilesService } from '../src/files/files.service.js'

describe('Files policy', () => {
  it('denies source for EndUser', async () => {
    const svc = new FilesService()
    try {
      // monkey patch ensureSourceAccess for test
      ;(svc as any).ensureSourceAccess({ role: 'EndUser' })
      throw new Error('should have thrown')
    } catch (e: any) {
      expect(e.message).toMatch(/restricted/i)
    }
  })
})

