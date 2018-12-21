<template>
  <div class="select-color">
    <transition name="fly-up">
      <div class="color-bar" v-if="focus" @touchstart="select" @touchmove="select">
        <div class="close" @touchstart.stop="delColor" />
        <div :style="{
          'transform': `translate3d(${b - 45}px, ${h + 5}px, 0)`
        }" class="cross"></div>
      </div>
    </transition>
    <transition name="fly-down">
      <div class="texture-bar" v-if="focus">
        <span class="prev" @touchstart="toggleTexture(-1)" />
        <p>{{catalog[texture]}}</p>
        <span class="next" @touchstart="toggleTexture(1)" />
      </div>
    </transition>
    <div class="target" :style="{ 'background-color': color }" @touchstart="toggleMenu">
      <div class="add-color" v-if="!color" />
      <transition name="fade">
        <div class="confirm" v-if="focus" />
      </transition>
    </div>
  </div>
</template>

<script>
import { catalog } from '../texture'

export default {
  name: 'SelectTexture',
  data () {
    return {
      catalog,
      focus: false,
      h: 0,
      b: 100
    }
  },
  props: ['color', 'texture'],
  created () {
    this.updateHB(this.color)
  },
  watch: {
    color (value) {
      this.updateHB(value)
    }
  },
  methods: {
    updateHB (color) {
      const res = color.match(/hsl\((\d+), \d+%, (\d+)%\)/)
      if (res) {
        this.h = Number(res[1])
        this.b = Number(res[2]) * 2
      } else {
        this.h = 0
        this.b = 100
      }
    },
    toggleMenu () {
      this.focus = !this.focus
      if (this.focus && !this.color) {
        const index = Math.floor(Math.random() * this.catalog.length)
        this.$emit('update:texture', index)
        const h = Math.floor(Math.random() * 360)
        const l = Math.floor(Math.random() * 25) + 25
        this.$emit('select', h, l)
      }
    },
    select (e) {
      const bar = this.$el.querySelector('.color-bar')
      const { left, top } = bar.getBoundingClientRect()
      const touch = e.touches[0]
      const l = Math.round(Math.max(Math.min(touch.clientX - left + 40, 100), 50) / 2)
      const h = Math.round(Math.max(Math.min(touch.clientY - top - 10, 360), 0))
      this.$emit('select', h, l)
    },
    toggleTexture (offset) {
      let index = this.texture + offset
      const count = this.catalog.length
      if (index < 0) {
        index += count
      } else if (index >= count) {
        index -= count
      }
      this.$emit('update:texture', index)
    },
    delColor () {
      this.focus = false
      this.$emit('delete')
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
.texture-bar
  position absolute
  left 0px
  top 76px
  width 70px
  border-radius 20px
  display flex
  flex-direction column
  align-items center
  span
    width 100%
    height 24px
    position relative
    &:after
      content ''
      position absolute
      width 0
      height 0
      top 8px
      left 27px
      border-left solid 8px transparent
      border-right solid 8px transparent
  .prev:after
    border-bottom solid 8px #fff
  .next:after
    border-top solid 8px #fff
  p
    margin 0
.fly-down-enter, .fly-down-leave-to
  transform translateY(-60px)
  opacity 0
.fly-down-enter-active
  transition transform .6s, opacity .6s
.fly-down-leave-active
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
.close
  width 0
  height 0
  position absolute
  top -20px
  left 30px
  transform rotate(45deg)
  &:before
    content ''
    width 20px
    height 0px
    left -12px
    top -2px
    border solid 2px #fff
    border-radius 2px
    position absolute
    background-color #fff
  &:after
    content ''
    width 0px
    height 20px
    left -2px
    top -12px
    border solid 2px #fff
    border-radius 2px
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
.confirm
  width 0
  height 0
  position absolute
  top 30px
  left 30px
  transform rotate(45deg)
  &:before
    content ''
    width 8px
    height 0px
    left -9px
    top 5px
    border solid 2px #fff
    border-radius 2px
    position absolute
    background-color #fff
  &:after
    content ''
    width 0px
    height 20px
    left 1px
    top -15px
    border solid 2px #fff
    border-radius 2px
    position absolute
    background-color #fff
.fade-enter, .fade-leave-to
  opacity 0
.fade-enter-active, .fade-leave-active
  transition opacity .3s
</style>
