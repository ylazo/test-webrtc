<template>
  <div class="row">
    <template v-for="(item, i) in videoList" :key="item.id">
      <div class="col relative-position">
        <video
          :id="item.id" :video="item" :height="cameraHeight" :muted="item.muted"
          :ref="el => { if (el) videos[i] = el }"
          autoplay playsinline
        >
        </video>
        <div
          v-if="!item.isLocal"
          class="row absolute-full controls justify-center" style="top: auto;bottom: 6px;"
        >
          <div class="col q-pa-sm col-auto">
            <q-btn
              round
              :icon="item.muted ? 'mdi-microphone-off' : 'mdi-microphone'"
              :color="item.muted ? 'red' : 'white'"
              :text-color="!item.muted ? 'black' : ''"
              @click="item.muted = !item.muted"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
  <div class="row justify-center">
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
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, toRef } from 'vue'
import { Socket } from 'socket.io-client/build/esm/socket.js'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import { io } from 'socket.io-client'
import { Video } from 'components/models'

// eslint-disable-next-line
const SimpleSignalClient = require('simple-signal-client')

export default defineComponent({
  name: 'quasar-webrtc',
  props: {
    deviceId: String,
    cameraHeight: {
      type: [Number, String],
      default: 160
    },
    roomId: {
      type: String,
      default: 'public-room-v2'
    }
  },
  emits: ['opened-room', 'joined-room', 'left-room', 'close-room'],
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

    const setAudio = () => {
      if (!localStream.value) return
      const audioTrack = localStream.value.getAudioTracks()[0]
      if (typeof audioTrack?.enabled === 'boolean') audioTrack.enabled = enableAudio.value
    }

    const setVideo = () => {
      if (!localStream.value) return
      const videoTrack = localStream.value.getVideoTracks()[0]

      if (typeof videoTrack?.enabled === 'boolean') videoTrack.enabled = enableVideo.value
    }

    const join = async () => {
      const socketUrl = 'http://localhost:3000'
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

            if (found) onPeer(peer, found)
          } catch {}
        })

        emit('opened-room', roomId.value)
      })

      // eslint-disable-next-line
      signalClient.value.on('request', async (request: any) => {
        // eslint-disable-next-line
        const { peer } = await request.accept({})

        const found = videoList.value.find(video => video.isLocal)

        if (found) onPeer(peer, found)
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
          muted: isLocal,
          stream: stream,
          isLocal: isLocal
        }

        videoList.value.push(video)
      }

      setTimeout(() => {
        for (let i = 0; i < videos.value.length; i++) {
          if (videos.value[i].id === stream.id) {
            videos.value[i].srcObject = stream
            break
          }
        }
      }, 500)

      emit('joined-room', stream.id)
    }

    // eslint-disable-next-line
    const onPeer = (peer: any, localStream: Video) => {
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
      // eslint-disable-next-line
      signalClient.value.peers().forEach((peer: any) => peer.removeAllListeners())
      // eslint-disable-next-line
      signalClient.value.destroy()
      signalClient.value = null
      localStream.value = null
      socket.value?.disconnect()
      socket.value?.close()
      socket.value = null

      emit('close-room')
    }

    onMounted(async () => {
      try {
        await join()
      } catch {}
    })

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
      videos
    }
  }
})
</script>
<style>
.controls {
  background: rgb(0,0,0);
  background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 100%);
}
</style>
