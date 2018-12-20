<template>
  <div id="draw-lamp">
    <div class="dl-canvas">
      <div class="dl-bg" :class="{ 'show-bg': showBG }" />
      <div class="dl-fg" :class="{ 'show-fg': !showBG }" />
      <p class="title">绘制你的彩灯</p>
      <svg>
        <mask id="svg-mask">
          <path id="svg-lamp" v-if="d" :d="d" fill="white" />
        </mask>
        <path id="svg-lamp" v-if="d" :d="d" :fill="color0" />
        <g class="texture"><texture :typeIndex="t1" v-if="color1" scale="1.4" :fill="color1" /></g>
        <g class="texture"><texture :typeIndex="t2" v-if="color2" scale="1.2" :fill="color2" /></g>
        <g class="texture"><texture :typeIndex="t3" v-if="color3" scale="1.0" :fill="color3" /></g>
      </svg>
      <canvas width="320" height="320" />
      <div class="dl-config" :class="{ 'show-cfg': !showBG }">
        <select-color :color="color0" @select="updateMainColor" />
        <select-texture :color="color1" :texture.sync="t1" @select="updateColor1" @delete="delColor(1)" />
        <select-texture :color="color2" :texture.sync="t2" @select="updateColor2" @delete="delColor(2)" />
        <select-texture :color="color3" :texture.sync="t3" @select="updateColor3" @delete="delColor(3)" />
      </div>
    </div>
    <div v-if="ready" class="button" @touchstart="submit">确定并提交</div>
  </div>
</template>

<script>
import { Texture } from '../texture'
import SelectColor from './SelectColor'
import SelectTexture from './SelectTexture'

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

const encodeColor = (hslString) => {
  const res = hslString.match(/hsl\((\d+), \d+%, (\d+)%\)/)
  if (res) {
    const h = Number(res[1])
    const b = Number(res[2]) * 2
    return (h * 128 + b).toString(16).padStart(4, '0')
  } else {
    return '0000'
  }
}

export default {
  name: 'DrawLamp',
  data () {
    return {
      canvas: null,
      ctx: null,
      showBG: true,
      canvasX: 0,
      canvasY: 0,
      points: [],
      disS: [],
      d: '',
      color0: 'hsl(0, 100%, 38%)',
      color1: 'hsl(0, 100%, 28%)',
      color2: '',
      color3: '',
      t1: 0,
      t2: 0,
      t3: 0,
      ready: false
    }
  },
  mounted () {
    const canvas = this.$el.querySelector('canvas')
    this.canvas = canvas
    const { x, y } = canvas.getBoundingClientRect()
    this.canvasX = x
    this.canvasY = y
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#8de462'
    ctx.lineWidth = 4
    this.ctx = ctx
    canvas.addEventListener('touchstart', this.beginPainting)
    canvas.addEventListener('touchend', this.endPainting)
  },
  methods: {
    processPoints () {
      const polar = []
      for (const point of this.points) {
        const x = point.x - 160
        const y = 172 - point.y
        const a = Math.atan2(x, y) + Math.PI
        const d = Math.sqrt(x * x + y * y)
        polar.push({ a, d })
      }
      polar.sort((a, b) => a.a - b.a)
      const p0 = polar[0]
      const pn = polar[polar.length - 1]
      const ddis = (pn.d - p0.d) * p0.a / (p0.a + Math.PI * 2 - pn.a) + p0.d
      polar.unshift({ a: 0, d: ddis })
      polar.push({ a: Math.PI * 2, d: ddis })
      const disS = []
      for (let i = 0; i < _S; i++) {
        const angle = PI_S * i
        let ddis = 118
        let prev = polar[0]
        for (let j = 1; j < polar.length; j++) {
          if ((prev.a - angle) * (polar[j].a - angle) <= 0) {
            ddis = (polar[j].d - prev.d) * (angle - prev.a) / (polar[j].a - prev.a) + prev.d
            break
          }
          prev = polar[j]
        }
        disS.push(Math.round(ddis))
      }

      this.disS = disS
      this.ready = true

      const pointS = disS.map((dis, i) => {
        return {
          x: -sinS[i] * dis,
          y: cosS[i] * dis
        }
      })

      const ctrlPointS = genControlPoints(pointS)

      const ctx = this.ctx
      ctx.beginPath()
      ctx.save()
      ctx.translate(160, 172)
      ctx.moveTo(pointS[_S - 1].x, pointS[_S - 1].y)
      let d = `M ${pointS[_S - 1].x} ${pointS[_S - 1].y} `
      for (let i = 0; i < _S; i++) {
        const p = pointS[i]
        const cp1 = (i === 0 ? ctrlPointS[_S - 1] : ctrlPointS[i - 1]).cpRight
        const cp2 = ctrlPointS[i].cpLeft
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y)
        d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p.x} ${p.y}`
      }
      ctx.closePath()
      ctx.restore()
      ctx.save()
      ctx.clearRect(0, 0, 320, 320)
      ctx.strokeStyle = '#e0eedc'
      ctx.stroke()
      ctx.restore()
      d += ' Z'
      this.d = d
    },
    beginPainting (e) {
      this.ready = false
      this.showBG = true
      this.points = []
      this.ctx.clearRect(0, 0, 320, 320)
      this.d = ''
      const touch = e.touches[0]
      const x = touch.clientX - this.canvasX
      const y = touch.clientY - this.canvasY
      this.points.unshift({ x, y })
      this.canvas.addEventListener('touchmove', this.painting)
    },
    painting (e) {
      const touch = e.touches[0]
      const x = touch.clientX - this.canvasX
      const y = touch.clientY - this.canvasY
      const lastPoint = this.points[0]
      this.points.unshift({ x, y })
      const ctx = this.ctx
      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    },
    endPainting () {
      this.showBG = false
      this.canvas.removeEventListener('touchmove', this.painting)
      this.processPoints()
    },
    updateMainColor (h, l) {
      this.color0 = `hsl(${h}, 100%, ${l}%)`
    },
    updateColor1 (h, l) {
      this.color1 = `hsl(${h}, 100%, ${l}%)`
    },
    updateColor2 (h, l) {
      this.color2 = `hsl(${h}, 100%, ${l}%)`
    },
    updateColor3 (h, l) {
      this.color3 = `hsl(${h}, 100%, ${l}%)`
    },
    delColor (index) {
      this[`color${index}`] = ''
      this[`t${index}`] = 0
    },
    submit () {
      // eslint-disable-next-line
      let code = this.disS.reduce((prev, current) => {
        return prev + Math.min(current, 255).toString(16)
      }, '0x')
      code += encodeColor(this.color0)
      code += encodeColor(this.color1) + this.t1.toString(16).padStart(2, '0')
      code += encodeColor(this.color2) + this.t2.toString(16).padStart(2, '0')
      code += encodeColor(this.color3) + this.t3.toString(16).padStart(2, '0')
      code += '99'
      this.$emit('finish')
    }
  },
  components: {
    Texture,
    SelectColor,
    SelectTexture
  }
}
</script>

<style lang="stylus" scoped>
#draw-lamp
  width 100%
  height 100%
  position fixed
  top 0
  left 0
  background-color #0006
  z-index 10001
.dl-canvas
  position absolute
  top 50%
  left 50%
  transform translate3d(-50%, -50%, 0)
  width 340px
  height 340px
  border-radius 20px
  border solid 10px #fff
  background-color #2f7165
  box-shadow 6px 6px 30px #0002 inset
.dl-bg
  position absolute
  top 10px
  left 10px
  width 320px
  height 320px
  background-image url(../assets/lamp_bg.png)
  background-repeat no-repeat
  background-position center
  opacity 0
  transition opacity .4s
.show-bg
  opacity .5
.dl-fg
  position absolute
  top 10px
  left 10px
  width 320px
  height 320px
  background-image url(../assets/lamp_fg.png)
  background-repeat no-repeat
  background-position center
  opacity 0
  transition opacity .4s
.show-fg
  opacity 1
.title
  font-size 30px
  line-height 30px
  position absolute
  margin 0
  left 10px
  top -40px
canvas
  position absolute
  top 10px
  left 10px
  width 320px
  height 320px
svg
  position absolute
  top 10px
  left 10px
  width 320px
  height 320px
  #svg-lamp
    transform translate3d(160px, 172px, 0)
  .texture
    mask url(#svg-mask)
    g
      transform-origin 160px 172px
.dl-config
  position absolute
  width 320px
  left 10px
  bottom -40px
  display flex
  justify-content space-between
  transform translateY(40px)
  opacity 0
  transition transform .6s, opacity .6s
  >div
    width 70px
    height 70px
.show-cfg
  transform translateY(0)
  opacity 1
.button
  position fixed
  bottom 20px
  left 50%
  transform translate3d(-50%, 0, 0)
</style>
