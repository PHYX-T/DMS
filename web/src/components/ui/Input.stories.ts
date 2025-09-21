import Input from './Input.vue'

export default { title: 'UI/Input', component: Input }

export const Basic = () => ({
  components: { Input },
  data: () => ({ value: '' }),
  template: '<div style="max-width:320px"><Input label="Name" v-model="value" placeholder="Jane Doe" hint="Enter full name" /></div>'
})

export const WithIcons = () => ({
  components: { Input },
  data: () => ({ value: '' }),
  template: `
    <div style="max-width:320px">
      <Input v-model="value" placeholder="Search">
        <template #leading>🔍</template>
        <template #trailing>⏎</template>
      </Input>
    </div>
  `
})

