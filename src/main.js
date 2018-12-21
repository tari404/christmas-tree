import Vue from 'vue'
import App from './App.vue'
import LetItSnow from 'vue-let-it-snow'
import Web3 from 'web3'

import abi from '../sol/abi.json'

Vue.use(LetItSnow)

Vue.config.productionTip = false

const web3t = new Web3('https://api.truescan.net/rpc/')
window.web3t = web3t
const contract = new web3t.eth.Contract(abi, '0xC2811eF426c9b30B9d94E4f4DF9b2DfFbf0dbCFA')
window.contract = contract

new Vue({
  render: h => h(App)
}).$mount('#app')
