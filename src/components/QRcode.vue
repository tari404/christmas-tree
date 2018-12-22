<template>
  <div id="qr-code" @touchstart="close"></div>
</template>

<script>
import QRcode from 'qrcode'

export default {
  name: 'QRcode',
  props: ['url'],
  watch: {
    url (value) {
      if (this.$el.childElementCount) {
        this.$el.removeChild(...this.$el.children)
      }
      if (value) {
        const canvas = document.createElement('canvas')
        QRcode.toCanvas(canvas, value, err => {
          if (err) {
            console.log(err)
          } else {
            canvas.style.width = '90px'
            canvas.style.height = '90px'
            canvas.style.margin = '-5px'
            this.$el.appendChild(canvas)
          }
        })
      }
    }
  },
  methods: {
    close () {
      this.$emit('end')
    }
  }
}
</script>

<style lang="stylus" scoped>
#qr-code
  position fixed
  top 20px
  left 20px
  width 80px
  height 80px
  overflow hidden
  z-index 10000
</style>
