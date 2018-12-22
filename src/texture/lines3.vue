<template>
  <g :style="{ 'transform': `scale(${scale || 1})` }">
    <rect x="0" y="0" width="320" height="113.316" />
    <rect x="0" y="230.684" width="320" height="89.316" />
  </g>
</template>

<script>
export default {
  name: 'TextureLines3',
  props: ['scale']
}
</script>
