import { boot } from 'quasar/wrappers'
import { api } from 'boot/axios'
import oauth2 from 'src/composables/oauth2.service'

const { getToken, destroyToken } = oauth2()

const setAxiosHeader = () => {
  api.defaults.headers = { Authorization: getToken() || '' }
}

setAxiosHeader()

export default boot(async () => {
  try {
    await api.get('auth/verify')
  } catch {
    destroyToken()
    setAxiosHeader()
  }
})

export { setAxiosHeader }
