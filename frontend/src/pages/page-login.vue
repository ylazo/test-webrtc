<template>
  <q-page class="row items-center justify-center" padding>
    <div class="col col-auto text-center">
      <component-box content flat v-bind="{ loading }" style="width: 100%;max-width: 240px;">
        <q-form @submit.prevent="loadLogin(username, password)" class="row justify-center q-col-gutter-sm">
          <div class="text-h4">Login</div>
          <div class="col col-12">
            <q-input dense outlined label="Usuario" v-model="username" :rules="[v => minLength(v, 3)]" />
          </div>
          <div class="col col-12">
            <q-input dense outlined label="Contraseña" v-model="password" :rules="[v => minLength(v, 3)]" type="password" />
          </div>
          <div class="col">
            <q-btn color="primary" label="Continuar" type="submit" />
          </div>
        </q-form>
      </component-box>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import { minLength } from 'src/composables/form-validation'
import auth from 'src/composables/auth'

export default defineComponent({
  name: 'page-login',
  setup () {
    const username: Ref<string> = ref('')
    const password: Ref<string> = ref('')
    const loading: Ref<boolean> = ref(false)
    const { login } = auth()

    const loadLogin = async (username: string, password: string) => {
      loading.value = true
      await login(username, password)
      loading.value = false
    }

    return { username, password, minLength, loadLogin, loading }
  }
})
</script>
