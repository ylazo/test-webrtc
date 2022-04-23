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
      <quasar-webrtc v-bind="{ roomId, socket, onCloseRoom }">
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
import { defineComponent, ref, Ref, toRef } from 'vue'
import quasarWebrtc from 'components/video-call/quasar-webrtc.vue'
import { Socket } from 'socket.io-client/build/esm/socket.js'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import oauth2 from 'src/composables/oauth2.service'
import { io } from 'socket.io-client'
import { useQuasar } from 'quasar'

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
    const roomId = toRef(props, 'roomId')
    const joined: Ref<boolean> = ref(false)
    const loading: Ref<boolean> = ref(false)
    const socket: Ref<Socket<DefaultEventsMap, DefaultEventsMap> | null> = ref(null)
    const { getToken } = oauth2()
    const socketUrl: string = process.env.backendUrl || ''

    const copyMeetLink = async () => {
      await navigator.clipboard.writeText(roomId.value)
      $q.notify({
        type: 'positive',
        color: 'grey-3',
        textColor: 'grey-9',
        message: 'El código de la reunión ha sido copiado'
      })
    }

    const connect = () => {
      const options = {
        rejectUnauthorized: true,
        transports: ['websocket'],
        auth: {
          token: getToken()
        }
      }

      loading.value = true
      socket.value = io(socketUrl, options)

      socket.value.on('connect', () => {
        joined.value = true
        loading.value = false
      })

      socket.value.on('connect_error', ({ message }: Error) => {
        $q.notify({ type: 'negative', message })
        loading.value = false
        onCloseRoom()
      })
    }

    const onCloseRoom = () => {
      joined.value = false
      socket.value?.disconnect()
      socket.value?.close()
      socket.value = null
    }

    return { joined, copyMeetLink, connect, socket, onCloseRoom, loading }
  }
})
</script>
