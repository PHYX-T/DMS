import DataGrid from './DataGrid.vue'

export default { title: 'Data/DataGrid', component: DataGrid }

export const Virtualized = () => ({
  components: { DataGrid },
  data: () => ({
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'name', label: 'Name', width: '2fr' },
      { key: 'role', label: 'Role', width: '1fr' },
    ],
    rows: Array.from({ length: 1000 }).map((_,i)=>({ id: i+1, name: `User ${i+1}`, role: i % 3 === 0 ? 'Admin' : 'Editor' }))
  }),
  template: `<DataGrid :columns="columns" :rows="rows" height="50vh" :row-height="44" />`
})

