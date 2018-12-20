<template>
  <div id="app" @touchstart.prevent @touchmove.prevent>
    <p id="title">{{owner}} 的圣诞树</p>
    <div id="tree"></div>
    <draw-lamp v-if="route === 'add'"/>
  </div>
</template>

<script>
import DrawLamp from '@/components/DrawLamp'

export default {
  name: 'App',
  data () {
    return {
      owner: 'undefined',
      route: ''
    }
  },
  components: {
    DrawLamp
  }
}
</script>

<style lang="stylus">
@import 'style.styl'

body
  overflow hidden

#app
  background-image url(./assets/bg.png)
  background-size cover
  width 100vw
  height 102vh

#title
  font-size 20px
  margin 0
  padding 34px
#tree
  position absolute
  width 378px
  height 594px
  left 11px
  top 50%
  transform translateY(-50%)
  background-size contain
  background-repeat no-repeat
  background-image url('./assets/tree.png')
</style>
