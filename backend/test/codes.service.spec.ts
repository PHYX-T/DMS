import { CodesService } from '../src/codes/codes.service.js'

describe('CodesService', () => {
  it('propose add and approve', async () => {
    const svc = new CodesService({ append: async () => ({}) } as any)
    await svc.propose('departments', { value: 'FIN', label: 'Finance', action: 'add' })
    await svc.approve('departments', 'FIN')
    const list = await svc.list('departments')
    expect(list.list.find((x:any) => x.value === 'FIN')).toBeTruthy()
  })
})

