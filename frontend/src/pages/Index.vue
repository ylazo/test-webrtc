<template>
  <q-page padding class="row items-center justify-center" style="max-width: 100%;">
    <div class="col col-auto" style="min-width: 280px;">
      <div class="row">
        <vue-webrtc ref="webrtc" width="100%" roomId="public-room-v2" style="width: 100%;">
        </vue-webrtc>
      </div>
      <div class="row justify-evenly">
        <q-btn color="primary" @click="onJoin" class="col" style="max-width: 48%;">Entrar</q-btn>
        <q-btn color="secondary" @click="onLeave" class="col" style="max-width: 48%;">Salir</q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import vueWebrtc from 'components/vue-webrtc'

export default {
  name: 'PageIndex',
  components: { vueWebrtc },
  methods: {
    onCapture () {
      this.img = this.$refs.webrtc.capture()
    },
    onJoin () {
      this.$refs.webrtc.join()
    },
    onLeave () {
      this.$refs.webrtc.leave()
    },
    onShareScreen () {
      this.img = this.$refs.webrtc.shareScreen()
    },
    onError (error, stream) {
      console.log('On Error Event', error, stream)
    },
    logEvent (event) {
      console.log('Event : ', event)
    }
  }
}
</script>
