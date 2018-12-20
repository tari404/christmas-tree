<template>
  <g :style="{ 'transform': `scale(${scale || 1})` }">
    <rect x="0" y="147" width="320" height="50"/>
    <rect x="0" y="212" width="320" height="15"/>
    <rect x="0" y="117" width="320" height="15"/>
  </g>
</template>

<script>
export default {
  name: 'TextureLines',
  props: ['scale']
}
</script>
