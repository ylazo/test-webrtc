<template>
  <div class="col relative-position">
    <video
      :id="id" :muted="muted"
      autoplay playsinline ref="video"
      style="width: 100%;display: block;max-height: 100%;"
    >
    </video>
    <div class="row absolute-full controls justify-center">
      <div class="col q-pa-sm col-auto" v-if="controls.mute && !isLocal">
        <q-btn
          round
          :icon="muted ? 'mdi-microphone-off' : 'mdi-microphone'"
          :color="muted ? 'red' : 'white'"
          :text-color="!muted ? 'black' : ''"
          @click="muted = !muted"
        />
      </div>
      <div class="col q-pa-sm col-auto" v-if="controls.fullscreen">
        <q-btn
          round
          icon="mdi-fullscreen"
          color="grey-8"
          @click="$emit('fullscreen')"
        />
      </div>
      <div class="col q-pa-sm col-auto" v-if="controls.exitFullscreen">
        <q-btn
          round
          icon="mdi-fullscreen-exit"
          color="grey-8"
          @click="$emit('exit-fullscreen')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, PropType, onMounted, toRef, watch } from 'vue'

interface Controls {
  mute?: boolean;
  fullscreen?: boolean;
  exitFullscreen?: boolean;
}

export default defineComponent({
  name: 'video-item',
  props: {
    isLocal: Boolean,
    id: String,
    controls: Object as PropType<Controls>,
    stream: {
      type: Object as PropType<MediaStream>,
      required: true
    }
  },
  setup (props) {
    const isLocal = toRef(props, 'isLocal')
    const stream = toRef(props, 'stream')
    const muted: Ref<boolean> = ref(isLocal.value)
    const video: Ref<HTMLVideoElement | null> = ref(null)

    const setVideo = () => {
      if (video.value) video.value.srcObject = stream.value
    }

    onMounted(setVideo)

    watch(stream, setVideo)

    return { muted, video }
  }
})
</script>
