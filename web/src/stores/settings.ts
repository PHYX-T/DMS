import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({ rtl: false, locale: 'en', reducedMotion: false }),
  actions: {
    setRTL(v: boolean) { this.rtl = v; document.documentElement.dir = v ? 'rtl' : 'ltr' },
    setLocale(v: string) { this.locale = v },
    setReducedMotion(v: boolean) { this.reducedMotion = v },
  },
})

