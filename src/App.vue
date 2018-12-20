<template>
  <div id="app" @touchstart.prevent @touchmove.prevent>
    <let-it-snow v-bind="snowConf" :show="snow"></let-it-snow>
    <p id="title">{{owner === me ? '我' : owner}} 的圣诞树</p>
    <div id="tree"></div>
    <draw-lamp v-if="route === 'add'" @finish="backToHome" />
    <div id="buttons" v-if="route === ''">
      <div v-if="owner !== me" class="button" @touchstart="addLamp">帮好友挂上彩灯</div>
      <div v-if="owner !== me" class="button">查看我的圣诞树</div>
    </div>
  </div>
</template>

<script>
import DrawLamp from '@/components/DrawLamp'

export default {
  name: 'App',
  data () {
    return {
      owner: 'undefined',
      me: 'unknow',
      snow: false,
      snowConf: {
        windPower: 1,
        speed: 2,
        count: 14,
        size: 10,
        opacity: 1,
        images: [
          '/snow.png',
          '/snow_s.png'
        ]
      },
      treeInfo: {},
      route: ''
    }
  },
  mounted () {
    this.snow = true
  },
  methods: {
    addLamp () {
      this.route = 'add'
    },
    backToHome () {
      this.route = ''
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
  position fixed
  background-image url(./assets/bg.png)
  background-size cover
  width 100%
  height 100%

#title
  font-size 20px
  margin 0
  padding 34px
#tree
  position fixed
  width 378px
  height 594px
  left 11px
  top 50%
  transform translateY(-50%)
  background-size contain
  background-repeat no-repeat
  background-image url(./assets/tree.png)
#buttons
  position fixed
  left 0
  bottom 20px
  width 400px
  display flex
  justify-content center
  z-index 10000
.button
  margin 0 10px
</style>
