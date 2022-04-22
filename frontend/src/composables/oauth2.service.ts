export default () => {
  const ID_TOKEN_KEY = 'id_token'

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem(ID_TOKEN_KEY)
  }

  const saveToken = (token: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ID_TOKEN_KEY, token)
  }

  const destroyToken = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(ID_TOKEN_KEY)
  }

  return { getToken, saveToken, destroyToken }
}
