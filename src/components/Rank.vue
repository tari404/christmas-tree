<template>
  <div class="info-layer" :style="{ 'z-index': open ? 99999 : 10000 }">
    <div class="rank-index" @touchstart="toggleMenu(true)">排行榜</div>
    <div v-if="open" id="rank" @touchstart="toggleMenu(false)">
      <div>
        <p class="title">排行榜</p>
        <ul class="rank-info">
          <li>
            <span class="ranking">排名</span>
            <span class="name">昵称</span>
            <span class="count">彩灯</span>
          </li>
          <li v-for="(item, i) in rank" :key="i">
            <span class="ranking">{{i + 1}}</span>
            <span class="name">{{item.name}}</span>
            <span class="count">{{item.count}}</span>
          </li>
          <li></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

import config from '../../config.json'

export default {

  name: 'Rank',
  data () {
    return {
      open: false,
      rank: []
    }
  },
  created () {
    this.updateRankInfo()
  },
  methods: {
    updateRankInfo () {
      axios.get(config.backend + 'rank').then(res => {
        this.rank = res.data
      })
    },
    toggleMenu (states) {
      this.open = states
    }
  }
}
</script>

<style lang="stylus" scoped>
.rank-index
  position fixed
  top 140px
  height 30px
  line-height 30px
  right 0
  background-color #0006
  border-radius 15px 0 0 15px
  padding 0 10px 0 15px
#rank
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  z-index 10999
  div
    position fixed
    width 360px
    height calc(100% - 20px)
    top 20px
    left 20px
    z-index 11000
    background-color #fffd
    background linear-gradient(to bottom, #fffc, #fff)
    color #333
    border-radius 10px
  .title
    font-size 18px
    margin 24px
.rank-info
  margin 20px
  padding 0
  list-style none
  li
    line-height 44px
    display flex
    text-align center
    &:nth-child(odd)
      background-color #fffc
    &:nth-child(even)
      background-color #fff6
    &:first-child
      border-radius 10px 10px 0 0
      background-color #fff
    &:last-child
      border-radius 0 0 10px 10px
      background-color #fff
      height 10px
  .ranking
    width 60px
  .name
    width 200px
  .count
    width 60px
</style>
