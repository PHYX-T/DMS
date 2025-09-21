import { ref } from 'vue'
import Modal from './Modal.vue'
import Button from './Button.vue'

export default { title: 'UI/Modal', component: Modal }

export const Basic = () => ({
  components: { Modal, Button },
  setup() {
    const open = ref(false)
    return { open }
  },
  template: `
    <Button @click="open = true">Open Modal</Button>
    <Modal :open="open" @close="open = false" title="Confirm action">
      <p>Are you sure you want to proceed?</p>
      <template #footer>
        <Button variant="secondary" @click="open = false">Cancel</Button>
        <Button class="ml-2" @click="open = false">Confirm</Button>
      </template>
    </Modal>
  `
})

