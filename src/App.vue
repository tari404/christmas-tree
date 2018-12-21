<template>
  <div id="app" @touchstart.prevent @touchmove.prevent>
    <let-it-snow v-bind="snowConf" :show="snow"></let-it-snow>
    <!-- <p>{{status}}</p> -->
    <p v-if="queryID && !hasTree" class="tree-info">该圣诞树不存在</p>
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
      <div v-if="owner !== me && hasTree" class="button" @touchstart="jumpToMine">查看我的圣诞树</div>
      <div v-if="!hasTree && address" class="button" @touchstart="createNewTree">创建我的圣诞树</div>
      <div v-if="owner === me" class="button" @touchstart="share">邀请好友添加彩灯</div>
    </div>
  </div>
</template>

<script>
import Lamp from '@/components/Lamp'
import DrawLamp from '@/components/DrawLamp'
import axios from 'axios'

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
      this.status = '申请代币中...'
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
      status: '状态显示',
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
      treeLampsID: [],
      treeLamps: [],
      lampPos,
      route: ''
    }
  },
  created () {
    web3t = window.web3t
    contract = window.contract
    const res = location.search.match(/id=([0-9a-fA-F]+)/)
    if (res && res[1]) {
      const id = res[1]
      this.queryID = id
      this.queryTreeInfo(id)
    }
    this.getWeChatUserName().then(({ name, ok }) => {
      if (!ok) {
        this.me = ''
      } else {
        this.me = name
        const hash = web3t.utils.keccak256(name)
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
        name: 'testUser2',
        ok: true
      }
    },
    jumpToMine () {
      const url = config.frontEnd + '?id=' + this.myID
      window.location.href = url
    },
    share () {
      const url = config.frontEnd + '?id=' + this.treeID
      console.log(url)
      // TODO: share with wechat
    },
    async queryTreeInfo (id) {
      this.treeID = id
      this.loading = true
      contract.methods.getTreeInfo(id).call().then(res => {
        this.loading = false
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
          this.status = '完成'
        }).catch(err => {
          this.status = '失败'
          console.error(err)
        })
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
</style>
