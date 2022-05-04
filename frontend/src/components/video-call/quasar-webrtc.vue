<template>
  <div class="row">
    <video-container class="col col-10" v-if="!!selectedVideo">
      <video-item
        v-bind="selectedVideo" :controls="{ mute: true, exitFullscreen: true }"
        @exit-fullscreen="videoSelector = -1"
      >
      </video-item>
    </video-container>
    <div class="col">
      <div class="row">
        <template v-for="(item, i) in videoList" :key="item.id">
          <video-container v-if="videoSelector !== i">
            <video-item
              v-bind="item"
              :controls="{ mute: true, fullscreen: true }"
              @fullscreen="videoSelector = i"
            >
            </video-item>
          </video-container>
        </template>
      </div>
    </div>
  </div>
  <div class="row justify-center q-mt-sm">
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
    <div class="col col-auto q-pl-md" v-if="!screenStream">
      <q-btn
        padding="md" round
        color="white"
        icon="mdi-monitor-share"
        text-color="black"
        @click="shareScreen"
      />
    </div>
    <div class="col col-auto q-pl-md" v-else>
      <q-btn
        padding="md" round
        color="white"
        icon="mdi-monitor-off"
        text-color="black"
        @click="stopShareScreen"
      />
    </div>
    <div class="col col-auto q-pl-md">
      <q-btn padding="md" round color="white" text-color="black" icon="mdi-account-supervisor">
        <q-badge color="transparent" text-color="black" floating>
          <strong>{{ sessionLength }}</strong>
        </q-badge>
      </q-btn>
    </div>
    <div class="col col-auto q-pl-md">
      <q-btn padding="md" round color="red" icon="mdi-phone-hangup" @click="$emit('close-room')" />
    </div>
    <audio ref="joinCallAudio" preload="auto" src="sounds/join-call.mp3" v-show="false"></audio>
    <audio ref="leaveCallAudio" preload="auto" src="sounds/leave-call.mp3" v-show="false"></audio>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  Ref,
  ref,
  toRef,
  watch,
  computed,
  onBeforeUnmount,
  PropType
} from 'vue'
import { Socket } from 'socket.io-client/build/esm/socket.js'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import { Video, DiscoveryData } from 'components/models'
import videoContainer from 'components/video-container.vue'
import videoItem from 'components/video-item.vue'

// eslint-disable-next-line
const SimpleSignalClient = require('simple-signal-client')

export default defineComponent({
  name: 'quasar-webrtc',
  props: {
    deviceId: String,
    roomId: {
      type: String,
      required: true
    },
    socket: {
      type: Object as PropType<Socket<DefaultEventsMap, DefaultEventsMap>>,
      required: true
    },
    roomToken: {
      type: String,
      required: true
    }
  },
  emits: ['opened-room', 'joined-room', 'left-room', 'close-room', 'share-started', 'screen-shared'],
  components: { videoContainer, videoItem },
  setup (props, { emit }) {
    const deviceId = toRef(props, 'deviceId')
    const roomId = toRef(props, 'roomId')
    const socket = toRef(props, 'socket')

    const localStream: Ref<MediaStream | null> = ref(null)
    const videoList: Ref<Video[]> = ref([])
    const videos: Ref<HTMLVideoElement[]> = ref([])
    // eslint-disable-next-line
    const signalClient: Ref<any> = ref(null)
    const enableAudio: Ref<boolean> = ref(true)
    const enableVideo: Ref<boolean> = ref(true)

    const videoSelector: Ref<number> = ref(-1)
    const screenStream: Ref<MediaStream | null> = ref(null)

    const joinCallAudio: Ref<HTMLAudioElement | null> = ref(null)
    const leaveCallAudio: Ref<HTMLAudioElement | null> = ref(null)

    const sessionLength: Ref<number> = ref(0)

    const setAudio = () => {
      if (!localStream.value) return
      const audioTracks = localStream.value.getAudioTracks()
      if (typeof audioTracks[0]?.enabled === 'boolean') audioTracks[0].enabled = enableAudio.value
    }

    const setVideo = () => {
      if (!localStream.value) return
      const videoTracks = localStream.value.getVideoTracks()

      if (typeof videoTracks[0]?.enabled === 'boolean') videoTracks[0].enabled = enableVideo.value
    }

    watch(enableAudio, setAudio)

    watch(enableVideo, setVideo)

    const join = async () => {
      // eslint-disable-next-line
      signalClient.value = new SimpleSignalClient(socket.value)

      const constraints = {
        audio: true,
        video: !deviceId.value ? true : {
          deviceId: { exact: deviceId.value }
        }
      }

      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)

      joinedRoom(localStream.value, true)

      // eslint-disable-next-line
      signalClient.value.on('discover', (discoveryData: DiscoveryData) => {
        // eslint-disable-next-line
        discoveryData.peers.forEach(async peerID => {
          if (peerID === socket.value?.id) return
          try {
            // eslint-disable-next-line
            const { peer } = await signalClient.value.connect(peerID, roomId.value)

            if (localStream.value) onPeer(peer, localStream.value)
          } catch (e) {
            console.warn(e)
          }
        })

        sessionLength.value = discoveryData.peers.length

        emit('opened-room', roomId.value)
      })

      // eslint-disable-next-line
      signalClient.value.on('request', async (request: any) => {
        // eslint-disable-next-line
        const { peer } = await request.accept({})

        if (localStream.value) onPeer(peer, localStream.value)

        if (screenStream.value) onPeer(peer, screenStream.value)
      })

      // eslint-disable-next-line
      signalClient.value.discover({ roomId: roomId.value })

      setAudio()
      setVideo()
    }

    const onDisPeer = (stream: MediaStream) => {
      leaveRoom(stream)
      leaveCallAudio.value?.play().finally(() => null)
      // eslint-disable-next-line
      sessionLength.value = signalClient.value.peers().length + 1
    }

    // eslint-disable-next-line
    const onPeer = (peer: any, localStream: MediaStream) => {
      // eslint-disable-next-line
      if (peer.destroyed) return
      // eslint-disable-next-line
      peer.addStream(localStream)
      // eslint-disable-next-line
      peer.on('stream', async (remoteStream: MediaStream) => {
        // eslint-disable-next-line
        sessionLength.value = signalClient.value.peers().length + 1

        joinedRoom(remoteStream, false)

        // eslint-disable-next-line
        peer.on('close', async () => {
          onDisPeer(remoteStream)
        })

        // eslint-disable-next-line
        peer.on('track', (track: MediaStreamTrack, remoteStream: MediaStream) => {
          // eslint-disable-next-line
          track.addEventListener('mute', async () => onDisPeer(remoteStream))
        })
      })

      joinCallAudio.value?.play().finally(() => null)
    }

    const joinedRoom = (stream: MediaStream, isLocal: boolean) => {
      if (videoList.value.find(video => video.id === stream.id)) return

      videoList.value.push({ id: stream.id, stream, isLocal })

      emit('joined-room', stream.id)
    }

    const leaveRoom = (stream: MediaStream) => {
      videoList.value = videoList.value.filter(video => video.id !== stream.id)
      emit('left-room', stream.id)
    }

    const leave = () => {
      stopShareScreen()

      videoList.value.forEach(video => video.stream.getTracks().forEach(track => track.stop()))
      videoList.value = []

      localStream.value?.getTracks().forEach(track => track.stop())

      // eslint-disable-next-line
      signalClient.value.peers().forEach((peer: any) => {
        // eslint-disable-next-line
        if (peer.destroyed) return
        // eslint-disable-next-line
        peer.removeAllListeners()
      })

      // eslint-disable-next-line
      signalClient.value.destroy()
      signalClient.value = null

      localStream.value?.getTracks().forEach(track => track.stop())
      localStream.value = null
    }

    const shareScreen = async () => {
      try {
        screenStream.value = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        const screenVideoTracks: MediaStreamTrack[] = screenStream.value.getVideoTracks()

        screenVideoTracks[0]?.addEventListener('ended', () => {
          if (!screenStream.value) return

          leaveRoom(screenStream.value)
          screenStream.value = null
        })

        joinedRoom(screenStream.value, true)
        emit('share-started', screenStream.value.id)
        // eslint-disable-next-line
        signalClient.value?.peers().forEach((peer: any) => {
          // eslint-disable-next-line
          if (peer.destroyed) return
          if (screenStream.value) onPeer(peer, screenStream.value)
        })
      } catch (e) {
        console.warn(e)
      }
    }

    const stopShareScreen = () => {
      try {
        // eslint-disable-next-line
        signalClient.value?.peers().forEach((peer: any) => {
          // eslint-disable-next-line
          if (peer.destroyed) return
          // eslint-disable-next-line
          if (screenStream.value) peer.removeStream(screenStream.value)
        })
        videoList.value = videoList.value.filter(video => video.id !== screenStream.value?.id)
        screenStream.value?.getTracks().forEach(track => track.stop())
        screenStream.value = null
      } catch (e) {
        console.warn(e)
      }
    }

    const selectedVideo = computed(() => videoList.value[videoSelector.value])

    onMounted(async () => {
      try {
        await join()
      } catch (e) {
        console.log(e)
      }
    })
    // hola
    onBeforeUnmount(leave)

    return {
      enableAudio,
      enableVideo,
      videoList,
      videos,
      videoSelector,
      selectedVideo,
      shareScreen,
      stopShareScreen,
      joinCallAudio,
      leaveCallAudio,
      screenStream,
      sessionLength
    }
  }
})
</script>
