import Tabs from './Tabs.vue'

export default { title: 'UI/Tabs', component: Tabs }

export const Basic = () => ({
  components: { Tabs },
  data: () => ({
    tabs: [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ],
    active: 'one'
  }),
  template: `
    <Tabs :tabs="tabs" v-model="active">
      <template #one>Tab one content</template>
      <template #two>Tab two content</template>
      <template #three>Tab three content</template>
    </Tabs>
  `
})

