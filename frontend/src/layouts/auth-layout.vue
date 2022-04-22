<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import auth from 'src/composables/auth'
import oauth2 from 'src/composables/oauth2.service'

export default defineComponent({
  name: 'auth-layout',
  setup () {
    const { onLoged } = auth()
    const { getToken } = oauth2()

    onMounted(async () => {
      if (getToken()) await onLoged()
    })

    return {}
  }
})
</script>
