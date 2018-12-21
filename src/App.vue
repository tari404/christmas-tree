<template>
  <div id="app" @touchstart.prevent @touchmove.prevent>
    <let-it-snow v-bind="snowConf" :show="snow"></let-it-snow>
    <p v-if="treeID !== myID && !hasTree" class="tree-info">该圣诞树不存在</p>
    <p v-else-if="!hasTree" class="tree-info">你还没有自己的圣诞树</p>
    <p v-else class="tree-info">{{owner === me ? '我' : owner}} 的圣诞树</p>
    <div :style="{ 'opacity': hasTree ? 1 : .5 }" id="tree">
      <lamp v-for="(lamp, i) in treeLamps" :key="i"
        v-if="lamp.info" :info="lamp.info"
        size="66" :offset="lampPos[i]" />
    </div>
    <draw-lamp v-if="route === 'add'" @finish="backToHome" :me="me" :treeID="treeID" :address="address" />
    <div class="notice" v-if="!me">
      您现在以游客身份浏览
    </div>
    <div id="buttons" v-else-if="route === ''">
      <div v-if="treeLampsID.indexOf(myID) === -1 && hasTree" class="button" @touchstart="addLamp">挂上新的彩灯</div>
      <div v-if="treeID !== myID" class="button" @touchstart="jumpToMine">查看我的圣诞树</div>
      <div v-if="treeID === myID && !hasTree" class="button" @touchstart="createNewTree">创建我的圣诞树</div>
      <div v-if="owner === me" class="button" @touchstart="share">邀请好友添加彩灯</div>
    </div>
    <div v-if="status" id="tree-mask">
      <p v-html="status"></p>
    </div>
  </div>
</template>

<script>
import Lamp from '@/components/Lamp'
import DrawLamp from '@/components/DrawLamp'
import axios from 'axios'
import wx from "weixin-js-sdk"
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

const queryBalacne = address => {
  return axios.post(config.backend, {
    address
  })
}

function sendTxAfterCheck (address, cb) {
  web3t.eth.getBalance(address).then(res => {
    if (Number(res) < 20000000) {
      this.status = '生成能量中...<br>（仅第一次需要较长等待）'
      queryBalacne(address).then(cb)
    } else {
      cb()
    }
  })
}

export default {
  name: 'App',
  data () {
    return {
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
      treeLampsID: [],
      treeLamps: [],
      lampPos,
      route: ''
    }
  },
  created () {
    web3t = window.web3t
    contract = window.contract
    const res = location.search.match(/state=([0-9]+)/)
    if (res && res[1]) {
      const id = res[1]
      this.queryID = id
      this.queryTreeInfo(id)
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
        if (!this.queryID) {
          this.queryTreeInfo(id)
        }
      }
    })
  },
  mounted () {
    this.snow = true
    this.share()
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
        console.log(openid, name)
        return {
          openid,
          name,
          ok: true
        }
      }
      const code = location.search.match(/[?&]code=([^&#]+)/)[1]
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
          openid: 'test' + Math.floor(Math.random() * 10000),
          name: 'test',
          ok: true
        }
      }
    },
    jumpToMine () {
      this.queryTreeInfo(this.myID)
    },
    share () {
      const url = config.frontend + '?id=' + this.treeID
      this.injectWxShareMenu({ shareTitle: '用真心送祝福，祝福上链恒久流传', shareDescr: `我是${this.me}，给你送上圣诞祝福，邀请你一起点亮圣诞树`, shareIcon: config.frontend+'share_icon_20181221205910.jpg', shareUrl: url })
    },
    async queryTreeInfo (id) {
      const url = config.frontend + '?id=' + id
      this.treeID = id
      contract.methods.getTreeInfo(id).call().then(res => {
        this.hasTree = res.treeExist
        this.owner = res.owner
        this.treeLampsID = res.lampIDs
        this.treeLamps = []
        for (let i = 0; i < res.lampIDs.length; i++) {
          if (i >= 10) {
            break
          }
          this.treeLamps.push(new LampInfo(this.treeID, res.lampIDs[i]))
        }
      })
    },
    createNewTree () {
      const address = this.address
      if (!address) {
        return
      }
      sendTxAfterCheck.call(this, address, () => {
        this.status = '创建中...'
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
    // 向微信分享菜单注入分享内容
    injectWxShareMenu({shareUrl,shareTitle,shareDescr,shareIcon}) {
      let signUrl = encodeURIComponent(location.href.split("#")[0])
      let fd = new FormData()
      fd.append("url", signUrl);
      axios.post("http://sc.truescan.net/api/unauth/weixin/getWxSign",fd).then(res=>{
        console.log('sign url con is',res)
        if (res.data.code === 200) {
          let d = res.data.result
          wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: d.appId, // 必填，公众号的唯一标识
            timestamp: d.timestamp, // 必填，生成签名的时间戳
            nonceStr: d.nonceStr, // 必填，生成签名的随机串
            signature: d.signature, // 必填，签名
            jsApiList: ["onMenuShareAppMessage", "onMenuShareTimeline", "onMenuShareQQ"] 
          })
          wx.ready(() => {
            wx.onMenuShareAppMessage({
              title: shareTitle,
              desc: decodeURIComponent(shareDescr),
              link: shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: shareIcon, // 分享图标
              success: ()=> {
                // 用户点击了分享后执行的回调函数
                alert("分享微信好友成功")
              },
              cancel: ()=> {
                // 用户取消分享后执行的回调函数
                alert("取消分享")
              }
            })
            wx.onMenuShareTimeline({
              title: shareTitle,
              link: shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: shareIcon, // 分享图标
              success: ()=> {
                // 用户点击了分享后执行的回调函数
                alert("分享微信好友成功")
              },
              cancel: ()=> {
                // 用户取消分享后执行的回调函数
                alert("取消分享")
              }
            })
            wx.onMenuShareQQ({
              title: shareTitle, 
              desc: decodeURIComponent(shareDescr),
              link: shareUrl,
              imgUrl: shareIcon, 
              success: ()=> {
                // 用户确认分享后执行的回调函数
                alert("分享QQ好友成功")
              },
              cancel: ()=> {
                // 用户取消分享后执行的回调函数
                alert("取消分享")
              }
            })
          })
        }
      })
      
    }
  },
  components: {
    Lamp,
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
</style>
