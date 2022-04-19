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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import quasarWebrtc from 'components/video-call/quasar-webrtc.vue'

export default defineComponent({
  name: 'room-welcome',
  components: { quasarWebrtc },
  props: {
    roomId: {
      type: String,
      required: true
    }
  },
  setup () {
    const socketUrl: Ref<string> = ref('')
    const joined: Ref<boolean> = ref(false)

    const isProd = document.URL.includes('invernaderolabs')
    socketUrl.value = isProd ? 'https://fileback.invernaderolabs.com' : 'http://localhost:3000'

    return { joined, socketUrl }
  }
})
</script>
