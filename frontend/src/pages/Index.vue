<template>
  <q-page class="row items-center justify-evenly">
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
        <quasar-webrtc :camera-height="300" @close-room="joined = false">
        </quasar-webrtc>
      </template>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import quasarWebrtc from 'components/quasar-webrtc.vue'

export default defineComponent({
  name: 'PageIndex',
  components: { quasarWebrtc },
  setup () {
    return { joined: ref(false) }
  }
})
</script>
