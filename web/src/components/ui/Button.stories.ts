import Button from './Button.vue'

export default { title: 'UI/Button', component: Button }

export const Primary = () => ({ components: { Button }, template: '<Button variant="primary">Primary</Button>' })
export const Secondary = () => ({ components: { Button }, template: '<Button variant="secondary">Secondary</Button>' })
export const Danger = () => ({ components: { Button }, template: '<Button variant="danger">Delete</Button>' })

