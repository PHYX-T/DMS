export interface AppSettings {
  theme: 'light'|'dark'|'high-contrast'
  density: 'comfortable'|'compact'
  minorRevisionPolicy: boolean
  ssoConfigured: boolean
}

export const settingsService = {
  async get(): Promise<AppSettings> { await new Promise(r => setTimeout(r, 60)); return { theme: 'light', density: 'comfortable', minorRevisionPolicy: false, ssoConfigured: false } },
  async update(patch: Partial<AppSettings>): Promise<AppSettings> { await new Promise(r => setTimeout(r, 60)); return { theme: 'light', density: 'comfortable', minorRevisionPolicy: !!patch.minorRevisionPolicy, ssoConfigured: false } },
}

