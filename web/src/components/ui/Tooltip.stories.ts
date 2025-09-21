import Tooltip from './Tooltip.vue'
import Button from './Button.vue'

export default { title: 'UI/Tooltip', component: Tooltip }

export const Basic = () => ({
  components: { Tooltip, Button },
  template: `
    <Tooltip text="More info">
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  `
})

