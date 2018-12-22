<template>
  <div id="music">
    <div @touchstart="togglePlay">
      <svg :class="{
        'while-playing': playing
      }" viewBox="0 0 1024 1024" width="36" height="36">
        <path d="M775.588535 130.988182l-318.385335 101.344089c-38.685771 11.473221-69.77949 53.070818-69.77949 93.196613l0 344.187841 0 4.766768c0 0-23.446503-16.265972-74.606217-8.593174-75.514201 11.006538-136.674535 71.251491-136.674535 134.35151 0 63.073036 61.160333 101.758808 136.674535 90.786247 75.517599-10.972561 130.999782-69.308809 130.999782-132.441804L443.817276 460.380054c0-27.741191 32.0057-39.684894 32.0057-39.684894l281.616864-91.783571c0 0 31.538617-11.00254 31.538617 19.092455l0 239.021943c0 0-28.714532-16.71067-80.285367-10.505877-75.513602 9.564515-136.763874 68.397427-136.763874 131.466466 0 63.132996 61.250272 103.290769 136.763874 93.697273 75.488619-9.500559 136.674934-68.337467 136.674934-131.466666L845.368024 183.087659C845.368024 142.932084 814.278303 119.51556 775.588535 130.988182z" fill="#fff" />
      </svg>
    </div>
    <audio src="/Jingle_Bells.mp3" loop></audio>
  </div>
</template>

<script>
export default {
  name: 'Music',
  data () {
    return {
      playing: false,
      v: null
    }
  },
  mounted () {
    this.v = this.$el.querySelector('audio')
    this.tryToPlay()
  },
  methods: {
    tryToPlay () {
      this.v.play().then(() => {
        this.playing = true
      }).catch(() => {
        this.playing = false
      })
    },
    togglePlay () {
      if (this.playing) {
        this.playing = false
        this.v.pause()
      } else {
        this.tryToPlay()
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
#music
  position fixed
  z-index 12000
  top 30px
  right 20px
svg
  opacity .5
.while-playing
  opacity 1 !important
  animation shake 1s ease-in-out infinite alternate
@keyframes shake
  from
    transform rotate(10deg)
  to
    transform rotate(-10deg)
</style>
