import Pagination from './Pagination.vue'

export default { title: 'UI/Pagination', component: Pagination }

export const Basic = () => ({
  components: { Pagination },
  data: () => ({ page: 1 }),
  template: `<Pagination v-model:page="page" :page-size="10" :total="95" />`
})

