<template>
  <div class="row">
    <template v-for="item in videoList">
      <div :key="item.id" class="col relative-position">
        <video
          :id="item.id" :video="item" :height="cameraHeight" :muted="item.muted"
          ref="videos" autoplay playsinline
        >
        </video>
        <div
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
</template>

<script>
import { io } from 'socket.io-client'
const SimpleSignalClient = require('simple-signal-client')

export default {
  name: 'vue-webrtc',
  components: {
  },
  data () {
    return {
      signalClient: null,
      videoList: [],
      canvas: null,
      socket: null,
      localStream: null
    }
  },
  props: {
    roomId: {
      type: String,
      default: 'public-room-v2'
    },
    socketURL: {
      type: String,
      default: 'https://fileback.invernaderolabs.com'
      // default: 'http://localhost:3000'
      // default: 'https://192.168.1.201:3000'
    },
    cameraHeight: {
      type: [Number, String],
      default: 160
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    screenshotFormat: {
      type: String,
      default: 'image/jpeg'
    },
    enableAudio: {
      type: Boolean,
      default: true
    },
    enableVideo: {
      type: Boolean,
      default: true
    },
    enableLogs: {
      type: Boolean,
      default: false
    },
    peerOptions: {
      type: Object, // NOTE: use these options: https://github.com/feross/simple-peer
      default () {
        return {}
      }
    },
    deviceId: {
      type: String,
      default: null
    }
  },
  watch: {
    enableAudio () {
      this.setAudio()
    },
    enableVideo () {
      this.setVideo()
    }
  },
  mounted () {
  },
  methods: {
    setAudio () {
      if (!this.localStream) return
      const audioTracks = this.localStream.getAudioTracks()
      audioTracks[0].enabled = this.enableAudio
    },
    setVideo () {
      if (!this.localStream) return
      const videoTracks = this.localStream.getVideoTracks()
      videoTracks[0].enabled = this.enableVideo
    },
    async join () {
      const that = this
      this.log('join')
      this.socket = io(this.socketURL, { rejectUnauthorized: false, transports: ['websocket'] })
      this.signalClient = new SimpleSignalClient(this.socket)

      const constraints = {
        video: true,
        audio: true
      }

      if (that.deviceId && that.enableVideo) {
        constraints.video = { deviceId: { exact: that.deviceId } }
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.log('opened', this.localStream)
      this.joinedRoom(this.localStream, true)

      this.signalClient.once('discover', (discoveryData) => {
        that.log('discovered', discoveryData)
        async function connectToPeer (peerID) {
          if (peerID === that.socket.id) return
          try {
            that.log('Connecting to peer')
            const { peer } = await that.signalClient.connect(peerID, that.roomId, that.peerOptions)
            that.videoList.forEach(v => {
              if (v.isLocal) {
                that.onPeer(peer, v.stream)
              }
            })
          } catch (e) {
            that.log('Error connecting to peer')
          }
        }

        discoveryData.forEach((peerID) => connectToPeer(peerID))
        that.$emit('opened-room', that.roomId)
      })

      this.signalClient.on('request', async (request) => {
        that.log('requested', request)
        const { peer } = await request.accept({}, that.peerOptions)
        that.log('accepted', peer)
        that.videoList.forEach(v => {
          if (v.isLocal) {
            that.onPeer(peer, v.stream)
          }
        })
      })

      this.signalClient.discover(that.roomId)

      this.setAudio()
      this.setVideo()
    },
    onPeer (peer, localStream) {
      const that = this
      that.log('onPeer')
      peer.addStream(localStream)
      peer.on('stream', (remoteStream) => {
        that.joinedRoom(remoteStream, false)
        peer.on('close', () => {
          const newList = []
          that.videoList.forEach(function (item) {
            if (item.id !== remoteStream.id) {
              newList.push(item)
            }
          })
          that.videoList = newList
          that.$emit('left-room', remoteStream.id)
        })
        peer.on('error', (err) => {
          that.log('peer error ', err)
        })
      })
    },
    joinedRoom (stream, isLocal) {
      const that = this
      const found = that.videoList.find(video => {
        return video.id === stream.id
      })
      if (found === undefined) {
        const video = {
          id: stream.id,
          muted: isLocal,
          stream: stream,
          isLocal: isLocal
        }

        that.videoList.push(video)
      }

      setTimeout(function () {
        for (let i = 0, len = that.$refs.videos.length; i < len; i++) {
          if (that.$refs.videos[i].id === stream.id) {
            that.$refs.videos[i].srcObject = stream
            break
          }
        }
      }, 500)

      that.$emit('joined-room', stream.id)
    },
    leave () {
      this.videoList.forEach(v => v.stream.getTracks().forEach(t => t.stop()))
      this.videoList = []
      this.signalClient.peers().forEach(peer => peer.removeAllListeners())
      this.signalClient.destroy()
      this.signalClient = null
      this.localStream = null
      this.socket.destroy()
      this.socket = null
    },
    capture () {
      return this.getCanvas().toDataURL(this.screenshotFormat)
    },
    getCanvas () {
      const video = this.$refs.videos[0]
      if (video !== null && !this.ctx) {
        const canvas = document.createElement('canvas')
        canvas.height = video.clientHeight
        canvas.width = video.clientWidth
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
      }
      const { ctx, canvas } = this
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      return canvas
    },
    async shareScreen () {
      const that = this
      if (navigator.mediaDevices === undefined) {
        that.log('Error: https is required to load cameras')
        return
      }

      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        this.joinedRoom(screenStream, true)
        that.$emit('share-started', screenStream.id)
        that.signalClient.peers().forEach(p => that.onPeer(p, screenStream))
      } catch (e) {
        that.log('Media error: ' + JSON.stringify(e))
      }
    },
    log (message, data) {
      if (this.enableLogs) {
        console.log(message)
        if (data != null) {
          console.log(data)
        }
      }
    }
  }
}
</script>
<style>
.controls {
  background: rgb(0,0,0);
  background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 100%);
}
</style>
