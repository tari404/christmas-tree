<template>
  <div id="app">
    <p>首页</p>
    <draw-lamp/>
  </div>
</template>

<script>
import DrawLamp from '@/components/DrawLamp'

export default {
  name: 'App',
  components: {
    DrawLamp
  }
}
</script>

<style lang="stylus">
@import 'style.styl'

body
  background-image url(./assets/bg.png)
  background-size cover
</style>
