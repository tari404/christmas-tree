<template>
  <g :style="{ 'transform': `scale(${scale || 1})` }">
    <rect x="0" y="0" width="320" height="80" />
    <rect x="0" y="86" width="320" height="6" />
    <rect x="0" y="264" width="320" height="56" />
    <rect x="0" y="252" width="320" height="6" />
  </g>
</template>

<script>
export default {
  name: 'TextureLines4',
  props: ['scale']
}
</script>
