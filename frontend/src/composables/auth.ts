import { api } from 'boot/axios'
import { setAxiosHeader } from 'boot/auth'
import { AxiosResponse } from 'axios'
import { Login } from 'components/models'
import onError from 'src/composables/onError'
import { useRouter } from 'vue-router'
import oauth2 from 'src/composables/oauth2.service'

export default () => {
  const $router = useRouter()
  const { onAxiosError } = onError()
  const { saveToken, destroyToken } = oauth2()

  const login = async (username: string, password: string) => {
    try {
      const { data }: AxiosResponse<Login> = await api.post('auth/login', { username, password })
      onLogin(data)
      await onLoged()
    } catch (e) {
      onAxiosError(e)
    }
  }

  const onLogin = ({ accessToken }: Login) => {
    saveToken(accessToken)
    setAxiosHeader()
  }

  const onLoged = async () => {
    await $router.push('/meet').catch((e) => console.warn(e))
  }

  const onUnLoged = async () => {
    await $router.push('/login').catch((e) => console.warn(e))
  }

  const logout = async () => {
    destroyToken()
    setAxiosHeader()
    await onUnLoged()
  }

  return { login, onLogin, onLoged, onUnLoged, logout }
}
