import { WorkflowService } from '../src/workflow/workflow.service.js'

describe('WorkflowService', () => {
  const wf = new WorkflowService({
    byId: async (id: string) => ({ id, status: 'Approved', version: '1.0', issue_date: '2025-01-01', retention_years: 1 }),
  } as any, { append: async () => ({}) } as any, {} as any, { validateActiveCodes: async () => true } as any, { emit: async () => ({}) } as any)

  it('bumps version major/minor', () => {
    // @ts-ignore
    expect((wf as any).bumpVersion('1.0','major')).toBe('2.0')
    // @ts-ignore
    expect((wf as any).bumpVersion('1.0','minor')).toBe('1.1')
  })
})

