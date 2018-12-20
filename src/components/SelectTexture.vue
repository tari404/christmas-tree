<template>
  <div class="select-color">
    <transition name="fly-up">
      <div class="color-bar" v-if="focus" @touchstart="select" @touchmove="select">
        <div :style="{
          'transform': `translate3d(${b - 45}px, ${h + 5}px, 0)`
        }" class="cross"></div>
      </div>
    </transition>
    <div class="target" :style="{ 'background-color': color }" @touchstart="toggleMenu">
      <div class="add-color" v-if="!color"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectTexture',
  data () {
    return {
      focus: false,
      h: 0,
      b: 100
    }
  },
  props: ['color'],
  created () {
    const res = this.color.match(/hsl\((\d+), \d+%, (\d+)%\)/)
    if (res) {
      this.h = Number(res[1])
      this.b = Number(res[2]) * 2
    } else {
      this.h = 0
      this.b = 100
    }
  },
  watch: {
    color (value) {
      const res = value.match(/hsl\((\d+), \d+%, (\d+)%\)/)
      if (res) {
        this.h = Number(res[1])
        this.b = Number(res[2]) * 2
      } else {
        this.h = 0
        this.b = 100
      }
    }
  },
  methods: {
    toggleMenu () {
      this.focus = !this.focus
    },
    select (e) {
      const bar = this.$el.querySelector('.color-bar')
      const { x, y } = bar.getBoundingClientRect()
      const touch = e.touches[0]
      const l = Math.round(Math.max(Math.min(touch.clientX - x + 40, 100), 50) / 2)
      const h = Math.round(Math.max(Math.min(touch.clientY - y - 10, 360), 0))
      this.$emit('select', h, l)
    }
  }
}
</script>

<style lang="stylus" scoped>
.select-color
  position relative
.color-bar
  position absolute
  left 0px
  top -390px
  width 60px
  height 370px
  border solid 5px #e0eedc
  border-radius 20px
  background-image url(../assets/colors.jpg)
  background-position center
.fly-up-enter, .fly-up-leave-to
  transform translateY(60px)
  opacity 0
.fly-up-enter-active
  transition transform .6s, opacity .6s
.fly-up-leave-active
  transition transform .4s, opacity .4s
.cross
  width 0
  height 0
  position absolute
  top 0
  left 0
  &:before
    content ''
    width 10px
    height 2px
    left -5px
    top -1px
    position absolute
    background-color #fff
  &:after
    content ''
    width 2px
    height 10px
    left -1px
    top -5px
    position absolute
    background-color #fff
.target
  width 60px
  height 60px
  border-radius 15px
  position relative
  border solid 5px #e0eedc
  border-radius 20px
  background-color #fff
  box-shadow 2px 2px 10px #0003 inset
.add-color
  width 0
  height 0
  position absolute
  top 30px
  left 30px
  &:before
    content ''
    width 12px
    height 2px
    left -6px
    top -1px
    position absolute
    background-color #2d7265
  &:after
    content ''
    width 2px
    height 12px
    left -1px
    top -6px
    position absolute
    background-color #2d7265
</style>
