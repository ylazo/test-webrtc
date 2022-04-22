import ComponentBox from 'components/component-box.vue'
import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  app.component('component-box', ComponentBox)
})
