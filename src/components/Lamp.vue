<template>
  <div class="lamp" :style="{
    'transform': `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotate || 0}deg)`
  }">
    <svg viewBox="0 0 320 320" :width="width" :height="width" @touchstart="showInfo">
      <circle cx="160" cy="10" r="4" fill="#e0eedc" />
      <circle cx="160" cy="22" r="4" fill="#e0eedc" />
      <path d="M 160 60 l 20 0 l -8 -30 l -24 0 l -8 30 Z" fill="#e0eedc" />
      <mask :id="maskId">
        <path class="path" v-if="d" :d="d" fill="white" />
      </mask>
      <path class="path" v-if="d" :d="d" :fill="color0" />
      <g class="texture" :mask="`url(#${maskId})`"><texture :typeIndex="t1" v-if="color1" scale="1.4" :fill="color1" /></g>
      <g class="texture" :mask="`url(#${maskId})`"><texture :typeIndex="t2" v-if="color2" scale="1.2" :fill="color2" /></g>
      <g class="texture" :mask="`url(#${maskId})`"><texture :typeIndex="t3" v-if="color3" scale="1.0" :fill="color3" /></g>
      <path class="path" v-if="d" :d="d" fill="none" stroke="#e0eedc" stroke-width="10" />
    </svg>
  </div>
</template>

<script>
import { Texture } from '../texture'

const _S = 20 // subdivision
const PI_S = 2 * Math.PI / _S
const sinS = []
const cosS = []
for (let i = 0; i < _S; i++) {
  sinS.push(Math.sin(PI_S * i))
  cosS.push(Math.cos(PI_S * i))
}

const genControlPoints = (points) => {
  const dis = points.map((p, i, points) => {
    let prev = i - 1
    if (prev < 0) {
      prev += points.length
    }
    const prevP = points[prev]
    return Math.sqrt(Math.pow(p.x - prevP.x, 2) + Math.pow(p.y - prevP.y, 2))
  })
  let p1 = points[points.length - 1]
  const controlPoints = points.map((p, i, points) => {
    let next = i + 1
    if (next >= points.length) {
      next -= points.length
    }
    const p2 = points[next]
    const v1 = [(p1.x - p.x) / dis[i], (p1.y - p.y) / dis[i]]
    const v2 = [(p2.x - p.x) / dis[next], (p2.y - p.y) / dis[next]]
    const tangent = [v2[0] - v1[0], v2[1] - v1[1]]
    const cpLeft = {
      x: p.x - tangent[0] * dis[i] * 0.15,
      y: p.y - tangent[1] * dis[i] * 0.15
    }
    const cpRight = {
      x: p.x + tangent[0] * dis[next] * 0.15,
      y: p.y + tangent[1] * dis[next] * 0.15
    }
    p1 = p
    return { cpLeft, cpRight }
  })

  return controlPoints
}

const decodeColor = (hex) => {
  const value = Number('0x' + hex)
  if (!value) {
    return ''
  }
  const b = value % 128
  const h = (value - b) / 128
  return `hsl(${h}, 100%, ${b / 2}%)`
}

export default {
  name: 'Lamp',
  props: ['info', 'size', 'offset', 'rotate'],
  data () {
    return {
      d: '',
      t1: 0,
      t2: 0,
      t3: 0,
      color0: '',
      color1: '',
      color2: '',
      color3: ''
    }
  },
  computed: {
    maskId () {
      return 'mask-' + this.info
    },
    width () {
      return this.size || 66 + 'px'
    }
  },
  watch: {
    info () {
      this.update()
    }
  },
  created () {
    this.update()
  },
  methods: {
    showInfo () {
      this.$emit('detail')
    },
    update () {
      if (!this.info) {
        return
      }
      const info = this.info.replace(/0x/, '')
      const pointS = info.substr(0, 40).match(/\w{2}/g).map(item => {
        return Number('0x' + item)
      }).map((dis, i) => {
        return {
          x: -sinS[i] * dis,
          y: cosS[i] * dis
        }
      })
      const ctrlPointS = genControlPoints(pointS)
      let d = `M ${pointS[_S - 1].x} ${pointS[_S - 1].y} `
      for (let i = 0; i < _S; i++) {
        const p = pointS[i]
        const cp1 = (i === 0 ? ctrlPointS[_S - 1] : ctrlPointS[i - 1]).cpRight
        const cp2 = ctrlPointS[i].cpLeft
        d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p.x} ${p.y}`
      }
      d += ' Z'
      this.d = d
      this.color0 = decodeColor(info.substr(40, 4))
      this.color1 = decodeColor(info.substr(44, 4))
      this.color2 = decodeColor(info.substr(50, 4))
      this.color3 = decodeColor(info.substr(56, 4))
      this.t1 = Number('0x' + info.substr(48, 2))
      this.t2 = Number('0x' + info.substr(54, 2))
      this.t3 = Number('0x' + info.substr(60, 2))
    }
  },
  components: {
    Texture
  }
}
</script>

<style lang="stylus" scoped>
.lamp
  position absolute
  top 0
  left 50%
  transform-origin 0 0
svg
  transform translate3d(-50%, 0, 0)
.path
  transform translate3d(160px, 172px, 0)
.texture g
  transform-origin 160px 172px
</style>
