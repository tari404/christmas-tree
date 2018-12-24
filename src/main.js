import Vue from 'vue'
import App from './App.vue'
import LetItSnow from 'vue-let-it-snow'
import Web3 from 'web3'

import abi from '../sol/abi.json'
import config from '../config.json'

Vue.use(LetItSnow)

Vue.config.productionTip = false

const web3t = new Web3('https://api.truescan.net/rpc/')
window.web3t = web3t
const contract = new web3t.eth.Contract(abi, '0x3CC4bD65E7edac74Ce18E632ADaE691F32582F2a')
window.contract = contract

const ua = window.navigator.userAgent.toLowerCase()
if (/micromessenger/.test(ua) && !/code=/.test(location.search)) {
  const url = config.frontend
  const res = location.search.match(/id=([0-9]+(tari)?)/)
  let state = ''
  if (res && res[1]) {
    state = res[1]
  }
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${url}&response_type=code&scope=snsapi_userinfo${state ? '&state=' + state : ''}#wechat_redirect`
}

new Vue({
  render: h => h(App)
}).$mount('#app')
