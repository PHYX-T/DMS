export interface SnapshotStatus { lastSnapshotAt: string; rtoHours: number; rpoHours: number }

export const backupsService = {
  async status(): Promise<SnapshotStatus> { await new Promise(r => setTimeout(r, 100)); return { lastSnapshotAt: new Date().toISOString(), rtoHours: 4, rpoHours: 1 } },
  async snapshot(): Promise<{ ok: true; id: string }> { await new Promise(r => setTimeout(r, 150)); return { ok: true, id: String(Date.now()) } },
  async simulateRestore(): Promise<{ ok: true }> { await new Promise(r => setTimeout(r, 150)); return { ok: true } },
}

