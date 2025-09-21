import Badge from './Badge.vue'

export default { title: 'UI/Badge', component: Badge }

export const Variants = () => ({
  components: { Badge },
  template: `
    <div class="flex gap-2">
      <Badge kind="info">Info</Badge>
      <Badge kind="ok">OK</Badge>
      <Badge kind="warn">Warn</Badge>
      <Badge kind="error">Error</Badge>
    </div>
  `
})
