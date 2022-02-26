<template>
  <div class="col video-container bg-grey-9">
    <div class="row items-center" style="height: 100%;">
      <slot name="default"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'video-container'
})
</script>
