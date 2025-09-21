import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/app/root.vue'
import router from '@/app/router'
import i18n from '@/app/i18n'
import '@/design/tokens.css'
import '@/design/theme.css'
import '@/design/base.css'
import '@/assets/styles/tailwind.css'
import { initTheme } from '@/design/tokens'

const app = createApp(App)
initTheme()
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)

// Restore session and start idle tracking once Pinia is ready
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { useNotificationsStore } from '@/stores/notifications'
import { useTelemetryStore } from '@/stores/telemetry'
const auth = useAuthStore()
auth.restore()
auth.startIdleTracking()

// Online/offline event wiring
const system = useSystemStore()
window.addEventListener('online', () => system.setOnline(true))
window.addEventListener('offline', () => system.setOnline(false))

// Start notification stream (mock SSE)
const notify = useNotificationsStore()
notify.startStream()

// Telemetry opt-in and page views
const telemetry = useTelemetryStore(); telemetry.init()
router.afterEach((to) => { telemetry.trackPage(to.fullPath) })

app.mount('#app')

// Basic SW registration for PWA shell
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try { navigator.serviceWorker.register('/sw.js') } catch {}
  })
}
