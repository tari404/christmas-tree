<template>
  <g :style="{ 'transform': `scale(${scale || 1})` }">
    <rect x="0" y="191" width="320" height="11.1"/>
    <rect x="0" y="141" width="320" height="11.1"/>
    <g>
      <circle cx="10.3" cy="172" r="12"/>
      <circle cx="43.6" cy="172" r="12"/>
      <circle cx="76.8" cy="172" r="12"/>
      <circle cx="110" cy="172" r="12"/>
      <circle cx="143.3" cy="172" r="12"/>
      <circle cx="176.5" cy="172" r="12"/>
      <circle cx="209.8" cy="172" r="12"/>
      <circle cx="243" cy="172" r="12"/>
      <circle cx="276.2" cy="172" r="12"/>
      <circle cx="309.5" cy="172" r="12"/>
    </g>
  </g>
</template>

<script>
export default {
  name: 'TextureLines2',
  props: ['scale']
}
</script>
