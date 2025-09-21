import DataTable from './DataTable.vue'

export default { title: 'Data/DataTable', component: DataTable }

export const Basic = () => ({
  components: { DataTable },
  data: () => ({
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' }
    ],
    rows: Array.from({ length: 5 }).map((_,i)=>({ id: i+1, title: `Row ${i+1}` }))
  }),
  template: '<DataTable :columns="columns" :rows="rows" />'
})

