<template>
  <div id="app" @touchstart.prevent @touchmove.prevent>
    <let-it-snow v-bind="snowConf" :show="snow"></let-it-snow>
    <p v-if="!hasTree" class="tree-info">你还没有自己的圣诞树</p>
    <p v-else class="tree-info">{{owner === me ? '我' : owner}} 的圣诞树</p>
    <div :style="{ 'opacity': hasTree ? 1 : .5 }" id="tree" />
    <draw-lamp v-if="route === 'add'" @finish="backToHome" />
    <div class="notice" v-if="!me">
      您现在以游客身份浏览
    </div>
    <div id="buttons" v-else-if="route === ''">
      <div v-if="owner !== me && hasTree" class="button" @touchstart="addLamp">帮好友挂上彩灯</div>
      <div v-if="owner !== me && hasTree" class="button">查看我的圣诞树</div>
      <div v-if="!hasTree" class="button" @touchstart="createNewTree">创建我的圣诞树</div>
    </div>
  </div>
</template>

<script>
import DrawLamp from '@/components/DrawLamp'

export default {
  name: 'App',
  data () {
    return {
      owner: '',
      me: '',
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
      loading: true,
      hasTree: false,
      treeLamps: [],
      route: ''
    }
  },
  created () {
    const res = location.search.match(/user=([0-9a-fA-F]+)/)
    if (res && res[1]) {
      // eslint-disable-next-line
      const user = res[1]
      console.log(user)
      // TODO: use web3 to get tree info from contract
      this.hasTree = true
      this.owner = 'XXX'
      this.treeLamps = [
        '0x757575757575757575757575757575757575757518d00e54002254000bda0299',
        '0x6f716e6f7171706f7170707376736e6d747476726360714e036e4e027c5a0099',
        '0x7878787878787878787878787878787878787878b2cca35601a8be019c540399'
      ]
    }
    this.getWeChatUserName().then(({ name, ok }) => {
      if (!ok) {
        this.me = ''
      } else {
        this.me = name
      }
    })
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
    },
    async getWeChatUserName () {
      // TODO: to get user name
      return {
        name: 'testUser',
        ok: true
      }
    },
    createNewTree () {
      // TODO: create tree by username
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

.tree-info
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
.notice
  position fixed
  left 0
  bottom 30px
  width 400px
  text-align center
  color #000
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
