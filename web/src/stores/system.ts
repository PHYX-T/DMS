import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
  state: () => ({
    online: true,
    version: '0.1.0',
    indexingQueue: 12,
    storagePct: 42,
    ssoConfigured: false,
    minorRevisionPolicy: false,
    retentionPolicyNote: 'Retention is managed server-side per policy and schedule. Disposal is automatic when schedules elapse.',
    incident: false,
    incidentMessage: ''
  }),
  actions: {
    setOnline(v: boolean) { this.online = v },
    setSSOConfigured(v: boolean) { this.ssoConfigured = v },
    setMinorRevisionPolicy(v: boolean) { this.minorRevisionPolicy = v },
    setStoragePct(p: number) { this.storagePct = p },
    setIndexingQueue(n: number) { this.indexingQueue = n },
    setIncident(on: boolean, msg?: string) { this.incident = on; this.incidentMessage = msg || '' },
  },
})
