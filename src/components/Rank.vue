<template>
  <div class="info-layer" :style="{ 'z-index': open ? 99999 : 10000 }">
    <div class="rank-index" @touchstart="toggleMenu(true)">排行榜</div>
    <div class="rank-end">排名活动已结束</div>
    <div v-if="open" id="rank" @touchstart="toggleMenu(false)">
      <div>
        <p class="title">排行榜 (截止25日24:00)</p>
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

const rank = [
  { name: '丸子哥💙🍡', count: 901 },
  { name: '重生@升哥', count: 541 },
  { name: '丑货', count: 440 },
  { name: '若', count: 363 },
  { name: '回首', count: 216 },
  { name: '妙(初链)', count: 183 },
  { name: '🐳', count: 107 },
  { name: 'Deepblue', count: 94 },
  { name: 'Tariii', count: 72 },
  { name: '白龙马', count: 64 }
]

export default {
  name: 'Rank',
  data () {
    return {
      open: false,
      rank
    }
  },
  created () {
    // stop updating rankings
    // this.updateRankInfo()
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
.rank-end
  position fixed
  top 174px
  font-size 12px
  right 4px
  color #333
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
