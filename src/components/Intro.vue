<template>
  <div>
    <div v-if="!open" class="intro-index" @touchstart="toggleMenu(true)">活动说明</div>
    <div v-if="open" id="intro" @touchstart="toggleMenu(false)">
      <div>
        <p class="title">活动说明</p>
        <p class="content">创建自己的圣诞树，邀请朋友来挂上一颗独一无二的彩灯！</p>
        <p class="content">本小游戏基于区块链网络，所有的圣诞树和彩灯信息都会保存在TrueChain初链上。你的祝福不会随着时间的流逝，即使多年之后仍然可以留存。</p>
        <p class="content">本小游戏不会产生任何费用，也不会记录除微信昵称以外的任何信息。</p>
        <p class="content">PS：活动结束后，圣诞树上收到彩灯最多的前10名用户还将获得神秘礼物。</p>
        <p class="support">技术支持：TrueChain初链社区</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Intro',
  data () {
    return {
      open: false
    }
  },
  methods: {
    toggleMenu (states) {
      this.open = states
    }
  }
}
</script>

<style lang="stylus" scoped>
.intro-index
  position fixed
  top 80px
  height 30px
  line-height 30px
  right 0
  background-color #0006
  border-radius 15px 0 0 15px
  padding 0 10px 0 15px
#intro
  position fixed
  width calc(100% - 40px)
  height calc(100% - 20px)
  top 20px
  left 20px
  z-index 11000
  background-color #fffd
  background linear-gradient(top, #fffc, #fff)
  color #333
  border-radius 10px
  .title
    font-size 18px
    margin 24px
  .content
    margin 6px 0
    text-align left
    padding 4px 20px
    font-size 16px
    line-height 28px
  .support
    position absolute
    bottom 20px
    width 100%
</style>
