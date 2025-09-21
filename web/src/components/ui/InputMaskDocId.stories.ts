import InputMaskDocId from './InputMaskDocId.vue'

export default { title: 'Forms/InputMaskDocId', component: InputMaskDocId }

export const Basic = () => ({
  components: { InputMaskDocId },
  data: () => ({ value: '' }),
  template: `<div style="max-width:320px"><InputMaskDocId label="Document ID" v-model="value" /></div>`
})

