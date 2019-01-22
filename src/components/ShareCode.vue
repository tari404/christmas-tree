<template>
  <div id="share-qr-code">
    <p>请截图后在微信中识别二维码访问</p>
  </div>
</template>

<script>
import QRcode from 'qrcode'

export default {
  name: 'ShareCode',
  mounted () {
    this.genCode()
  },
  methods: {
    genCode () {
      const canvas = document.createElement('canvas')
      QRcode.toCanvas(canvas, location.origin, err => {
        if (err) {
          console.log(err)
        } else {
          this.$el.appendChild(canvas)
        }
      })
    }
  }
}
</script>

<style lang="stylus">
#share-qr-code
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  background-color #000a
  z-index 10000
  display flex
  flex-direction column-reverse
  justify-content center
  align-items center
  >canvas
    border-radius 10px
    overflow hidden
  p
    font-size 14px
</style>
