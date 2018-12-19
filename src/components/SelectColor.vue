<template>
  <div :style="{ 'background-color': color }">
  </div>
</template>

<script>
export default {
  name: 'SelectColor',
  props: ['color']
}
</script>
