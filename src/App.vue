<template>
  <div id="app" @touchstart.prevent @touchmove.prevent>
    <let-it-snow v-bind="snowConf" :show="snow"></let-it-snow>
    <p v-if="treeID !== myID && !hasTree" class="tree-info">该圣诞树不存在</p>
    <p v-else-if="!hasTree" class="tree-info">你还没有自己的圣诞树</p>
    <p v-else class="tree-info">{{owner === me ? '我' : owner}} 的圣诞树</p>
    <div id="tree" :style="{
      'background-image': tariMode ? 'url(/tree_nologo.png)' : 'url(/tree.png)',
      'opacity': hasTree ? 1 : .5,
      'transform': `translateY(-50%) scaleY(${treeScale}) skewX(${treeSkew}deg)`
    }">
      <lamp v-for="(lamp, i) in treeLamps" :key="i"
        v-if="lamp.info" :info="lamp.info"
        size="66" :offset="lampPos[i]" :rotate="dGamma"
        @detail="setDetail(lamp.creater, lamp.lampID)" />
    </div>
    <div class="turn-left" :style="{
      'opacity': lampsOffset > 0 ? 1 : .2
    }" @touchstart="turning(-10)" />
    <div class="turn-right" :style="{
      'opacity': lampsOffset + 10 < lampsCount ? 1 : .2
    }" @touchstart="turning(10)" />
    <draw-lamp v-if="route === 'add'" @finish="backToHome"
      :me="me" :treeID="treeID" :address="address" :tariMode="tariMode" />
    <div class="notice" v-if="!me">
      您现在以游客身份浏览，请在微信中打开
    </div>
    <div id="buttons" v-else-if="route === ''">
      <div v-if="treeLampsID.indexOf(myID) === -1 && hasTree" class="button" @touchstart="addLamp">挂上新的彩灯</div>
      <div v-if="treeID !== myID" class="button" @touchstart="jumpToMine">查看我的圣诞树</div>
      <div v-if="treeID === myID && !hasTree" class="button" @touchstart="createNewTree">创建我的圣诞树</div>
      <div v-if="owner === me" class="button" @touchstart="share(true)">邀请好友添加彩灯</div>
    </div>
    <div v-if="status" id="tree-mask">
      <p v-html="status"></p>
    </div>
    <div v-if="showShareNotice" id="share-mask" @touchstart="closeShareNotice()"></div>
    <div v-if="friend" id="friend-mask" @touchstart="setDetail('', '')">
      <p>来自 {{friend}} 的彩灯</p>
      <span @touchstart="showFriend">查看TA的圣诞树</span>
    </div>
    <intro v-if="!tariMode" />
    <rank v-if="!tariMode" />
    <q-rcode :url="shareUrl" @end="closeQRCode" />
    <music @toggle="updateMusicState" />
  </div>
</template>

<script>
import Lamp from '@/components/Lamp'
import DrawLamp from '@/components/DrawLamp'
import Intro from '@/components/Intro'
import Rank from '@/components/Rank'
import QRcode from '@/components/QRcode'
import Music from '@/components/Music'
import axios from 'axios'
import wx from 'weixin-js-sdk'

import config from '../config.json'

let web3t, contract

const lampPos = [
  { x: -16, y: 148 },
  { x: 37, y: 212 },
  { x: -42, y: 241 },
  { x: 70, y: 297 },
  { x: 0, y: 327 },
  { x: -78, y: 337 },
  { x: 114, y: 397 },
  { x: -119, y: 411 },
  { x: -42, y: 416 },
  { x: 40, y: 428 }
]

class LampInfo {
  constructor (treeID, lampID) {
    this.treeID = treeID
    this.lampID = lampID
    this.creater = ''
    this.info = ''
    this.score = 0
    contract.methods.getLampInfo(treeID, lampID).call().then(res => {
      this.creater = res.creater
      this.info = res.info
      this.score = res.score
    })
  }
}

const queryBalacne = (address, tariMode) => {
  return axios.post(config.backend, {
    address,
    tariMode
  })
}

function sendTxAfterCheck (address, cb) {
  web3t.eth.getBalance(address).then(res => {
    if (Number(res) < 20000000) {
      this.status = '生成能量中...<br>（仅第一次需要较长等待）'
      queryBalacne(address, this.tariMode).then(cb)
    } else {
      cb()
    }
  })
}

export default {
  name: 'App',
  data () {
    return {
      raf: 0,
      tariMode: false,
      queryID: '',
      treeID: '',
      owner: '',
      me: '',
      myID: '',
      address: '',
      status: '',
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
      hasTree: false,
      lampsCount: 0,
      lampsOffset: 0,
      treeLampsID: [],
      treeLamps: [],
      lampPos,
      route: '',
      friend: '',
      friendID: '',
      showShareNotice: false,
      shareUrl: '',
      musicPlaying: false,
      rotateGamma: 0,
      aGamma: 0,
      dGamma: 0,
      treeScale: 1,
      treeSkew: 0
    }
  },
  created () {
    web3t = window.web3t
    contract = window.contract
    const res = location.search.match(/state=([0-9]+)(tari)?/)
    if (res && res[1]) {
      const id = res[1]
      this.queryID = id
    }
    if (res && res[2]) {
      this.tariMode = true
    }
    this.getWeChatUserName().then(({ openid, name, ok }) => {
      if (!ok) {
        this.me = ''
      } else {
        this.me = name
        const hash = web3t.utils.keccak256(openid)
        const account = web3t.eth.accounts.privateKeyToAccount(hash)
        web3t.eth.accounts.wallet.add(account)
        const id = web3t.utils.hexToNumberString(account.address.substr(0, 18))
        this.address = account.address
        this.myID = id
        this.queryTreeInfo(this.queryID || id)
      }
    })
  },
  mounted () {
    this.snow = true
    this.raf = requestAnimationFrame(this.update)
    window.addEventListener('deviceorientation', this.orient, false)
  },
  methods: {
    addLamp () {
      this.route = 'add'
    },
    backToHome () {
      this.route = ''
      this.queryTreeInfo(this.treeID)
    },
    async getWeChatUserName () {
      const openid = sessionStorage.getItem('xmas-openid')
      const name = sessionStorage.getItem('xmas-name')
      if (openid && name) {
        return {
          openid,
          name,
          ok: true
        }
      }
      const res = location.search.match(/[?&]code=([^&#]+)/)
      if (!res) {
        return { ok: false }
      }
      const code = res[1]
      if (code !== 'test') {
        return axios.get(config.backend + 'nickname', {
          params: { code }
        }).then(res => {
          sessionStorage.setItem('xmas-openid', res.data.openid)
          sessionStorage.setItem('xmas-name', res.data.name)
          return res.data
        }).catch(err => {
          console.error(err)
          return { ok: false }
        })
      } else {
        return {
          openid: 'test-2',
          name: 'test-2',
          ok: true
        }
      }
    },
    jumpToMine () {
      this.queryTreeInfo(this.myID)
    },
    share (showShareNotice) {
      const url = config.frontend + '?id=' + this.treeID + (this.tariMode ? 'tari' : '')
      if (this.me) {
        let shareTitle = '祝福上初链(TRUE)，真心永流传！'
        let shareDescr = `我是${this.me}，给你送上圣诞祝福，邀请你一起点亮圣诞树`
        if (this.tariMode) {
          shareTitle = '点亮大家的圣诞树 ﾟ∀ﾟ)σ'
          shareDescr = `和我一起来为${this.owner ? this.owner : '朋友们'}添上独一无二的圣诞彩灯~`
        }
        this.injectWxShareMenu({
          shareTitle,
          shareDescr,
          shareIcon: config.frontend + 'share_icon_20181221205910.jpg',
          shareUrl: url
        })
      }
      if (showShareNotice) {
        this.shareUrl = url
      }
      this.showShareNotice = showShareNotice
    },
    closeQRCode () {
      this.shareUrl = ''
    },
    turning (offset) {
      const to = this.lampsOffset + offset
      if (to >= 0 && to < this.lampsCount) {
        this.lampsOffset = to
        this.updateLamps()
      }
    },
    updateLamps () {
      this.treeLamps = []
      for (let i = 1; i <= 10; i++) {
        const index = this.treeLampsID.length - i - this.lampsOffset
        if (index < 0) {
          break
        }
        this.treeLamps.push(new LampInfo(this.treeID, this.treeLampsID[index]))
      }
    },
    async queryTreeInfo (id) {
      contract.methods.getTreeInfo(id).call().then(res => {
        this.treeID = id
        this.shareUrl = ''
        this.hasTree = res.treeExist
        this.owner = res.owner
        this.share(false)
        this.treeLampsID = res.lampIDs
        if (this.tariMode) {
          const tariIndex = this.treeLampsID.indexOf('9800756971716071407')
          if (tariIndex > -1) {
            this.treeLampsID.splice(tariIndex, 1)
            this.treeLampsID.push('9800756971716071407')
          }
        }
        this.lampsCount = this.treeLampsID.length
        this.lampsOffset = 0
        this.updateLamps()
      })
    },
    createNewTree () {
      const address = this.address
      if (!address) {
        return
      }
      sendTxAfterCheck.call(this, address, () => {
        this.status = '数据上链中...'
        contract.methods.createNewTree(this.me).send({
          from: this.address,
          gas: 2000000,
          gasPrice: 1
        }).then(res => {
          this.status = '创建完成'
        }).catch(err => {
          this.status = '创建失败，请稍等刷新重试'
          console.error(err)
        }).then(() => {
          this.queryTreeInfo(this.treeID)
          setTimeout(() => {
            this.status = ''
          }, 2000)
        })
      })
    },
    injectWxShareMenu ({ shareUrl, shareTitle, shareDescr, shareIcon }) {
      let signUrl = encodeURIComponent(location.href.split('#')[0])
      axios.get(config.backend + 'wx-sign?signUrl=' + signUrl).then(res => {
        // console.log('sign url con is', res.data)
        if (res.data.code === 200) {
          let d = res.data.result
          wx.config({
            debug: false,
            appId: d.appId,
            timestamp: d.timestamp,
            nonceStr: d.nonceStr,
            signature: d.signature,
            jsApiList: [
              'updateAppMessageShareData',
              'updateTimelineShareData',
              'onMenuShareAppMessage',
              'onMenuShareTimeline'
            ]
          })
          wx.ready(() => {
            wx.updateAppMessageShareData({
              title: shareTitle,
              desc: decodeURIComponent(shareDescr),
              link: shareUrl,
              imgUrl: shareIcon
            })
            wx.updateTimelineShareData({
              title: shareDescr,
              link: shareUrl,
              imgUrl: shareIcon
            })
            wx.onMenuShareAppMessage({
              title: shareTitle,
              desc: decodeURIComponent(shareDescr),
              link: shareUrl,
              imgUrl: shareIcon
            })
            wx.onMenuShareTimeline({
              title: shareDescr,
              link: shareUrl,
              imgUrl: shareIcon
            })
          })
        }
      })
    },
    setDetail (friend, id) {
      this.friend = friend
      this.friendId = id
    },
    showFriend () {
      this.queryTreeInfo(this.friendId)
    },
    closeShareNotice () {
      this.showShareNotice = false
    },
    orient (e) {
      const gamma = e.gamma
      this.rotateGamma = Math.max(Math.min(30, -gamma), -30)
    },
    updateMusicState (playing) {
      this.musicPlaying = playing
    },
    update (time) {
      this.aGamma += (this.rotateGamma - this.dGamma) * 0.16
      this.dGamma += (this.aGamma - this.dGamma) * 0.04
      this.treeScale += (1 - this.treeScale) * 0.04
      this.treeSkew *= 0.96
      if (this.musicPlaying && this.hasTree) {
        this.dGamma += Math.sin(time / 212) / 5
        this.treeScale += Math.sin(time / 423) / 1400
        this.treeSkew += Math.sin(time / 1694) / 20
      }
      this.raf = requestAnimationFrame(this.update)
    }
  },
  beforeDestroy () {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('deviceorientation', this.orient, false)
  },
  components: {
    Lamp,
    DrawLamp,
    Intro,
    Rank,
    QRcode,
    Music
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
  position relative
  z-index 10000
  font-size 20px
  margin 0
  line-height 40px
  padding 30px
#tree
  position fixed
  width 378px
  height 594px
  left 11px
  top 50%
  transform-origin 50% 100%
  background-size contain
  background-repeat no-repeat
  background-image url(/tree.png)
.turn-left
  position fixed
  top 50%
  left 10px
  width 30px
  height 80px
  background-image url(./assets/turn-left.png)
  z-index 13000
.turn-right
  position fixed
  top 50%
  right 10px
  width 30px
  height 80px
  background-image url(./assets/turn-right.png)
  z-index 13000
.notice
  position fixed
  left 0
  bottom 30px
  width 400px
  text-align center
  color #333
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
#tree-mask
  position fixed
  z-index 20000
  width 100%
  height 100%
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  background-color #000a
#share-mask
  position fixed
  z-index 21000
  width 100%
  height 100%
  top 0
  left 0
  background-color #000a
  background-image url(./assets/share.png)
  background-repeat no-repeat
  background-position 94% 1%
#friend-mask
  position fixed
  color #333
  z-index 22000
  width 100%
  height 100%
  font-size 20px
  top 0
  left 0
  display flex
  flex-direction column
  align-items center
  justify-content center
  background-color #fffc
  span
    font-size 14px
    color #fff
    background-color #0c806ccc
    padding 2px 10px
    line-height 16px
    border-radius 10px
</style>
