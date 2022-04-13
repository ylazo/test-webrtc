<template>
  <q-page class="row items-center justify-evenly" padding>
    <div class="col col-auto">
      <template  v-if="!joined">
        <div class="row">
          <q-btn
            padding="md lg" label="Iniciar llamada" icon-right="mdi-phone-hangup" color="primary" rounded uneleva
            @click="joined = true"
          ></q-btn>
        </div>
      </template>
      <template v-else>
        <quasar-webrtc :socket-url="socketUrl" @close-room="joined = false">
        </quasar-webrtc>
      </template>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import quasarWebrtc from 'components/quasar-webrtc.vue'

export default defineComponent({
  name: 'PageIndex',
  components: { quasarWebrtc },
  setup () {
    const socketUrl: Ref<string> = ref('')
    const joined: Ref<boolean> = ref(false)

    const isProd = document.URL.includes('invernaderolabs')
    socketUrl.value = isProd ? 'https://fileback.invernaderolabs.com' : 'http://localhost:3000'

    return { joined, socketUrl }
  }
})
</script>
