import { AxiosError } from 'axios'
import { ServerError } from 'components/models'
import { useQuasar } from 'quasar'

export default () => {
  const $q = useQuasar()

  const isAxiosError = (error: unknown): error is AxiosError<ServerError> => {
    return (error as AxiosError<ServerError>).isAxiosError !== undefined
  }

  const onAxiosError = (e: unknown) => {
    if (!isAxiosError(e)) return
    if (!e.response?.data) console.warn(e.response?.data)
    if (!e.response?.data.message) return

    $q.notify({
      type: 'warning',
      color: 'warning',
      message: e.response?.data.message
    })
  }

  return { onAxiosError, isAxiosError }
}
