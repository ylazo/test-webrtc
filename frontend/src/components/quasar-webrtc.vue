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
    <div class="col col-auto q-pl-md">
      <q-btn
        padding="md" round
        color="white"
        icon="mdi-monitor-share"
        text-color="black"
        @click="shareScreen"
      />
    </div>
    <div class="col col-auto q-pl-md">
      <q-btn padding="md" round color="red" icon="mdi-phone-hangup" @click="leave" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, toRef, watch, computed } from 'vue'
import { Socket } from 'socket.io-client/build/esm/socket.js'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import { io } from 'socket.io-client'
import { Video } from 'components/models'
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
      default: 'public-room-v2'
    }
  },
  emits: ['opened-room', 'joined-room', 'left-room', 'close-room', 'share-started'],
  components: { videoContainer, videoItem },
  setup (props, { emit }) {
    const deviceId = toRef(props, 'deviceId')
    const roomId = toRef(props, 'roomId')
    const socket: Ref<Socket<DefaultEventsMap, DefaultEventsMap> | null> = ref(null)
    const localStream: Ref<MediaStream | null> = ref(null)
    const videoList: Ref<Video[]> = ref([])
    const videos: Ref<HTMLVideoElement[]> = ref([])
    // eslint-disable-next-line
    const signalClient: Ref<any> = ref(null)
    const enableAudio: Ref<boolean> = ref(true)
    const enableVideo: Ref<boolean> = ref(true)

    const videoSelector: Ref<number> = ref(-1)

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
      // const socketUrl = 'http://localhost:3000'
      const socketUrl = 'https://fileback.invernaderolabs.com'
      socket.value = io(socketUrl, { rejectUnauthorized: false, transports: ['websocket'] })
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
      signalClient.value.once('discover', (discoveryData: string[]) => {
        // eslint-disable-next-line
        discoveryData.forEach(async peerID => {
          if (peerID === socket.value?.id) return
          try {
            // eslint-disable-next-line
            const { peer } = await signalClient.value.connect(peerID, roomId.value)

            const found = videoList.value.find(video => video.isLocal)

            if (found) onPeer(peer, found.stream)
          } catch {}
        })

        emit('opened-room', roomId.value)
      })

      // eslint-disable-next-line
      signalClient.value.on('request', async (request: any) => {
        // eslint-disable-next-line
        const { peer } = await request.accept({})

        const found = videoList.value.find(video => video.isLocal)

        if (found) onPeer(peer, found.stream)
      })

      // eslint-disable-next-line
      signalClient.value.discover(roomId.value)
      setAudio()
      setVideo()
    }

    const joinedRoom = (stream: MediaStream, isLocal: boolean) => {
      const found = videoList.value.find(video => video.id === stream.id)

      if (found === undefined) {
        const video = {
          id: stream.id,
          stream: stream,
          isLocal: isLocal
        }

        videoList.value.push(video)
      }

      emit('joined-room', stream.id)
    }

    // eslint-disable-next-line
    const onPeer = (peer: any, localStream: MediaStream) => {
      // eslint-disable-next-line
      peer.addStream(localStream)
      // eslint-disable-next-line
      peer.on('stream', (remoteStream: MediaStream) => {
        joinedRoom(remoteStream, false)

        // eslint-disable-next-line
        peer.on('close', () => {
          videoList.value = videoList.value.filter(video => video.id !== remoteStream.id)
          emit('left-room', remoteStream.id)
        })
      })
    }

    const leave = () => {
      videoList.value.forEach(video => video.stream.getTracks().forEach(t => t.stop()))
      videoList.value = []
      try {
        // eslint-disable-next-line
        signalClient.value.peers().forEach((peer: any) => peer.removeAllListeners())
      } catch {}
      // eslint-disable-next-line
      signalClient.value.destroy()
      signalClient.value = null
      localStream.value = null
      socket.value?.disconnect()
      socket.value?.close()
      socket.value = null

      emit('close-room')
    }

    const shareScreen = async () => {
      if (navigator.mediaDevices === undefined) return

      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        joinedRoom(screenStream, true)
        emit('share-started', screenStream.id)
        // eslint-disable-next-line
        signalClient.value.peers().forEach((p: any) => onPeer(p, screenStream))
      } catch {}
    }

    const selectedVideo = computed(() => videoList.value[videoSelector.value])

    onMounted(join)

    return {
      socket,
      setAudio,
      enableAudio,
      enableVideo,
      join,
      joinedRoom,
      leave,
      videoList,
      localStream,
      videos,
      videoSelector,
      selectedVideo,
      shareScreen
    }
  }
})
</script>
