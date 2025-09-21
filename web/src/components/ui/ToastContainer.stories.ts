import { ref } from 'vue'
import ToastContainer from './ToastContainer.vue'
import Button from './Button.vue'
import { useNotificationsStore } from '@/stores/notifications'

export default { title: 'UI/Toast', component: ToastContainer }

export const Basic = () => ({
  components: { ToastContainer, Button },
  setup() {
    const pushInfo = () => useNotificationsStore().push('Saved successfully', 'info')
    const pushWarn = () => useNotificationsStore().push('Check your inputs', 'warn')
    const pushError = () => useNotificationsStore().push('Something went wrong', 'error')
    return { pushInfo, pushWarn, pushError }
  },
  template: `
    <div>
      <div class="flex gap-2">
        <Button @click="pushInfo">Info</Button>
        <Button variant="secondary" @click="pushWarn">Warn</Button>
        <Button variant="danger" @click="pushError">Error</Button>
      </div>
      <ToastContainer />
    </div>
  `
})

