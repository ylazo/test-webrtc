<template>
  <q-page class="row items-center justify-center" padding>
    <router-view />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  setup () {
    return {}
  }
})
</script>
