<template>
  <div class="col col-auto">
    <template v-if="!joined">
      <div class="row">
        <q-btn
          padding="md lg" label="Iniciar llamada" icon-right="mdi-phone-hangup" color="primary" rounded uneleva
          @click="connect"
          :loading="loading"
        ></q-btn>
      </div>
    </template>
    <template v-else>
      <quasar-webrtc v-bind="{ roomId, socket, onCloseRoom, roomToken }">
      </quasar-webrtc>
    </template>
    <q-card style="position: absolute;top: 3%;left: 3%;width: 300px;" class="shadow-16">
      <q-card-section>
        <div class="row items-center">
          <div class="col q-pr-sm">
            <q-field outlined label="Compartir reuníón" stack-label>
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">{{ roomId }}</div>
              </template>
            </q-field>
          </div>
          <q-btn color="light-blue-2" round text-color="primary" icon="mdi-content-copy" @click.stop="copyMeetLink" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, toRef, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, format } from 'quasar'
import { useRouter } from 'vue-router'
// import { AxiosResponse } from 'axios'
import { RoomAuthorization, joinRequestData } from 'components/models'
import oauth2 from 'src/composables/oauth2.service'
import oauth2Rooms from 'src/composables/oauth2.rooms.service'
import onError from 'src/composables/onError'
import { Socket } from 'socket.io-client/build/esm/socket.js'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import { io } from 'socket.io-client'
import quasarWebrtc from 'components/video-call/quasar-webrtc.vue'

const { capitalize } = format

export default defineComponent({
  name: 'room-welcome',
  components: { quasarWebrtc },
  props: {
    roomId: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const $q = useQuasar()
    const router = useRouter()
    const { getToken } = oauth2()
    const { getToken: getRoomToken, saveToken: saveRoomToken } = oauth2Rooms()
    const { onAxiosError } = onError()

    const roomId = toRef(props, 'roomId')
    const joined: Ref<boolean> = ref(false)
    const loading: Ref<boolean> = ref(false)
    const socket: Ref<Socket<DefaultEventsMap, DefaultEventsMap> | null> = ref(null)
    const socketUrl: string = process.env.backendUrl || ''
    const roomToken: Ref<string> = ref('')

    const connect = () => {
      const options = {
        rejectUnauthorized: true,
        transports: ['websocket'],
        auth: {
          token: getToken(),
          roomToken: getRoomToken()
        }
      }

      socket.value = io(socketUrl, options)

      socket.value.on('connect', () => {
        joinRequest()
      })

      socket.value.on('connect_error', ({ message }: Error) => {
        $q.notify({ type: 'negative', message })
        loading.value = false
        onCloseRoom()
      })

      socket.value.on('joinRequest', ({ requesterId, username }: joinRequestData) => {
        $q.dialog({
          title: 'Alguien quiere unirse a esta reunión',
          message: `${capitalize(username)} quiere unirse a la reunión`
        }).onOk(() => {
          socket.value?.emit('joinResponse', { roomId: roomId.value, requesterId })
        })
      })

      socket.value.on('joinRequest_error', ({ message }: Error) => {
        console.warn(message)
        loading.value = false
      })

      socket.value.on('joinResponse', ({ token }: RoomAuthorization) => {
        loading.value = false
        saveRoomToken(token)

        if (!socket.value) return

        onCloseRoom()
        connect()
      })

      socket.value.on('roomJoined', () => {
        joined.value = false
      })
    }

    const joinRequest = () => {
      socket.value?.emit('joinRequest', { roomId: roomId.value })
      loading.value = true
    }

    const onCloseRoom = () => {
      joined.value = false
      socket.value?.disconnect()
      socket.value?.close()
      socket.value = null
    }

    const copyMeetLink = async () => {
      await navigator.clipboard.writeText(roomId.value)
      $q.notify({
        type: 'positive',
        color: 'grey-3',
        textColor: 'grey-9',
        message: 'El código de la reunión ha sido copiado'
      })
    }

    onMounted(async () => {
      try {
        const params = { roomId: roomId.value }
        await api.get('/rooms', { params })
      } catch (e) {
        onAxiosError(e)
        router.push('/meet').catch((e) => console.warn(e))
      }
    })

    return { joined, copyMeetLink, connect, socket, onCloseRoom, joinRequest, loading, roomToken }
  }
})
</script>
