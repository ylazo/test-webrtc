<template>
  <q-card v-bind="$attrs">
    <q-linear-progress indeterminate class="absolute" v-show="loading" />
    <slot v-if="content">
    </slot>
    <slot v-else name="no-content">
      <q-card-section class="row items-center">
        <q-icon name="mdi-alert-circle-outline" size="24px" class="q-mr-sm" />
        No hay datos disponibles por el momento
      </q-card-section>
    </slot>
    <q-inner-loading :showing="loading || disable" :style="loading ? 'top: 3px;' : ''">
      <slot v-if="disable" name="disable">
        <div></div>
      </slot>
      <slot v-else-if="loading" name="loading">
        <div></div>
      </slot>
    </q-inner-loading>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'component-box',
  inheritAttrs: false,
  props: { loading: Boolean, disable: Boolean, content: Boolean }
})
</script>
