<template>
  <div class="col col-auto">
    <template v-if="!joined">
      <div class="row">
        <q-btn
          padding="md lg" label="Iniciar llamada" icon-right="mdi-phone-hangup" color="primary" rounded uneleva
          @click="joined = true"
        ></q-btn>
      </div>
    </template>
    <template v-else>
      <quasar-webrtc :room-id="roomId" :socket-url="socketUrl" @close-room="joined = false">
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
    const socketUrl: Ref<string> = ref('')
    const joined: Ref<boolean> = ref(false)
    const roomId = toRef(props, 'roomId')
    const $q = useQuasar()

    socketUrl.value = process.env.backendUrl || ''

    const copyMeetLink = async () => {
      await navigator.clipboard.writeText(roomId.value)
      $q.notify({
        type: 'positive',
        timeout: 4000,
        // position: 'center',
        message: 'El código de la reunión ha sido copiado'
      })
    }

    return { joined, socketUrl, copyMeetLink }
  }
})
</script>
