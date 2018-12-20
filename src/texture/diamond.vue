<template>
  <g :style="{ 'transform': `scale(${scale || 1})` }">
    <g style="transform: translateY(3px)">
    <polygon points="31.1,107 15.6,128.6 0,107 15.6,85.4 "/>
    <polygon points="72.4,107 56.8,128.6 41.3,107 56.8,85.4 "/>
    <polygon points="113.7,107 98.1,128.6 82.5,107 98.1,85.4 "/>
    <polygon points="154.9,107 139.4,128.6 123.8,107 139.4,85.4 "/>
    <polygon points="196.2,107 180.6,128.6 165.1,107 180.6,85.4 "/>
    <polygon points="237.5,107 221.9,128.6 206.3,107 221.9,85.4 "/>
    <polygon points="278.7,107 263.2,128.6 247.6,107 263.2,85.4 "/>
    <polygon points="320,107 304.4,128.6 288.9,107 304.4,85.4 "/>
    <polygon points="31.1,232 15.6,253.6 0,232 15.6,210.4 "/>
    <polygon points="72.4,232 56.8,253.6 41.3,232 56.8,210.4 "/>
    <polygon points="113.7,232 98.1,253.6 82.5,232 98.1,210.4 "/>
    <polygon points="154.9,232 139.4,253.6 123.8,232 139.4,210.4 "/>
    <polygon points="196.2,232 180.6,253.6 165.1,232 180.6,210.4 "/>
    <polygon points="237.5,232 221.9,253.6 206.3,232 221.9,210.4 "/>
    <polygon points="278.7,232 263.2,253.6 247.6,232 263.2,210.4 "/>
    <polygon points="320,232 304.4,253.6 288.9,232 304.4,210.4 "/>
    </g>
  </g>
</template>

<script>
export default {
  name: 'TextureDiamond',
  props: ['scale']
}
</script>
