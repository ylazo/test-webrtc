<template>
  <div class="col col-auto q-pa-sm">
    <q-btn outlined no-caps color="primary" label="Crear reunión" @click="createRoom" />
  </div>
  <div class="col col-auto q-pa-sm">
    <form @submit.prevent="submit" class="row items-center">
      <div class="col col-auto">
        <q-input
          label="Insertar código de reunión"
          dense outlined hide-bottom-space
          v-model="code"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-keyboard-variant" />
          </template>
        </q-input>
      </div>
      <div class="col col-auto q-pl-sm">
        <q-btn
          type="submit" label="Unirse" color="primary" flat no-caps
          :disable="!valid"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4, validate as uuidValidate } from 'uuid'

export default defineComponent({
  name: 'room-options',
  setup () {
    const router = useRouter()
    const code: Ref<string> = ref('')
    const minLength = 5

    const valid = computed(() => !(code.value.length < minLength))

    const createRoom = () => {
      goRoom(uuidv4() + '')
    }

    const goRoom = (uuid: string) => {
      router.push(`/${uuid}`).catch((e) => console.warn(e))
    }

    const submit = () => {
      if (uuidValidate(code.value)) {
        goRoom(code.value)
      } else {
        createRoom()
      }
    }

    return { code, createRoom, submit, valid }
  }
})
</script>
