<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title>
          <router-link to="/" style="text-decoration: none;color: white;">
            Video meet
          </router-link>
        </q-toolbar-title>

        <q-btn dense flat round icon="mdi-menu">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click.stop="logout">
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import oauth2 from 'src/composables/oauth2.service'
import auth from 'src/composables/auth'

export default defineComponent({
  name: 'MainLayout',
  setup () {
    const { onUnLoged, logout } = auth()
    const { getToken } = oauth2()

    onMounted(async () => {
      if (!getToken()) await onUnLoged()
    })

    return { logout, getToken, onUnLoged }
  }
})
</script>
