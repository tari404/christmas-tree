<template>
  <g :style="{ 'transform': `scale(${scale || 1})` }">
    <rect y="120" width="320" height="104"/>
  </g>
</template>

<script>
export default {
  name: 'TextureLines2',
  props: ['scale']
}
</script>
