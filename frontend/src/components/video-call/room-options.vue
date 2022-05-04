<template>
  <component-box content :loading="loading" flat>
    <div class="row">
      <div class="col col-auto q-pa-sm">
        <q-btn outlined no-caps color="primary" label="Crear reunión" @click="createRoom" />
      </div>
      <div class="col col-auto q-pa-sm">
        <form @submit.prevent="submit" class="row items-center">
          <div class="col col-auto">
            <q-input
              label="Insertar código de reunión"
              dense outlined hide-bottom-space
              v-model="code"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-keyboard-variant" />
              </template>
            </q-input>
          </div>
          <div class="col col-auto q-pl-sm">
            <q-btn
              type="submit" label="Unirse" color="primary" flat no-caps
              :disable="!valid"
            />
          </div>
        </form>
      </div>
    </div>
  </component-box>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue'
import { api } from 'boot/axios'
import { AxiosResponse } from 'axios'
import { useRouter } from 'vue-router'
import { v4 as uuidv4, validate as uuidValidate } from 'uuid'
import { RoomAuthorization } from 'components/models'
import onError from 'src/composables/onError'
import oauth2Rooms from 'src/composables/oauth2.rooms.service'
import oauth2 from 'src/composables/oauth2.service'

export default defineComponent({
  name: 'room-options',
  setup () {
    const router = useRouter()
    const { onAxiosError } = onError()
    const { saveToken: saveRoomToken } = oauth2Rooms()
    const { getToken } = oauth2()
    const loading: Ref<boolean> = ref(false)

    const code: Ref<string> = ref('')
    const minLength = 4

    const valid = computed(() => !(code.value.length < minLength))

    const createRoom = async () => {
      loading.value = true
      try {
        const roomId = uuidv4() + ''
        const { data }: AxiosResponse<RoomAuthorization> = await api.post('/rooms', { roomId })
        const { token } = data
        saveRoomToken(token)
        api.defaults.headers = { Authorization: getToken(), 'room-authorization': token }
        goRoom(roomId)
      } catch (e) {
        onAxiosError(e)
      }
      loading.value = false
    }

    const goRoom = (uuid: string) => {
      router.push(`/meet/${uuid}`).catch((e) => console.warn(e))
    }

    const submit = async () => {
      if (uuidValidate(code.value)) {
        goRoom(code.value)
        code.value = ''
      } else {
        await createRoom()
      }
    }

    return { code, createRoom, submit, valid, loading }
  }
})
</script>
