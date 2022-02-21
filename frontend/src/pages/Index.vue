<template>
  <q-page padding class="row items-center justify-center" style="max-width: 100%;">
    <div class="col col-auto">
      <div class="row" v-if="!joined">
        <q-btn
          padding="md lg" label="Iniciar llamada" icon-right="mdi-phone-hangup" color="primary" rounded uneleva
          @click="join"
        ></q-btn>
      </div>
      <vue-webrtc
        v-show="joined"
        ref="webrtc" width="100%" roomId="public-room-v2" style="width: 100%;"
        :enable-audio="enableAudio"
        :enable-video="enableVideo"
        :camera-height="300" enable-logs
      >
      </vue-webrtc>
      <div class="row justify-center q-mt-sm" v-if="joined">
        <div class="col col-auto">
          <q-btn
            padding="md" round
            :color="enableAudio ? 'white' : 'red'"
            :icon="enableAudio ? 'mdi-microphone' : 'mdi-microphone-off'"
            :text-color="enableAudio ? 'black' : ''"
            @click="enableAudio = !enableAudio"
          />
        </div>
        <div class="col col-auto q-pl-md">
          <q-btn
            padding="md" round
            :color="enableVideo ? 'white' : 'red'"
            :icon="enableVideo ? 'mdi-video' : 'mdi-video-off'"
            :text-color="enableVideo ? 'black' : ''"
            @click="enableVideo = !enableVideo"
          />
        </div>
        <div class="col col-auto q-pl-md">
          <q-btn padding="md" round color="red" icon="mdi-phone-hangup" @click="leave" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import vueWebrtc from 'components/vue-webrtc'

export default {
  name: 'PageIndex',
  components: { vueWebrtc },
  data () {
    return {
      enableAudio: true,
      enableVideo: true,
      joined: false
    }
  },
  methods: {
    join () {
      this.joined = true
      this.onJoin()
    },
    leave () {
      this.joined = false
      this.onLeave()
    },
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
