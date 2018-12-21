const express = require('express')
const bodyParser = require('body-parser')
const Web3 = require('web3')
const axios = require('axios')

const config = require('./config.json')

const request = require('request')

const web3t = new Web3('https://api.truescan.net/rpc/')
const account = web3t.eth.accounts.privateKeyToAccount(config.privKey)
web3t.eth.accounts.wallet.add(account)
const from = account.address

let nonce = 0
web3t.eth.getTransactionCount(from).then(n => {
  nonce = n
  console.log(`nonce: ${n}`)
})

const app = express()
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  next()
})

app.get('/', (_, res) => {
  res.send('hello world')
})

const sendTransaction = (to, nonce, res, retry) => {
  retry = retry || 1
  let unusual = true
  setTimeout(() => {
    if (unusual) {
      sendTransaction(to, nonce, res, retry + 1)
    }
  }, 30000)
  web3t.eth.sendTransaction({
    from,
    to,
    value: '2000000000',
    nonce,
    gas: 21000,
    gasPrice: retry
  }).on('transactionHash', () => {
    unusual = false
  }).on('receipt', () => {
    console.log(`send to user: ${to}`)
    return res.json({
      error: false,
      code: 20,
      from: '[POST /]',
      msg: 'Success'
    })
  }).on('error', () => {
    console.log(`error at nonce: ${nonce}`)
  })
}

app.post('/', (req, res) => {
  const data = req.body
  const address = data.address
  if (!web3t.utils.isAddress(address)) {
    return res.json({
      error: true,
      code: 10,
      from: '[POST /]',
      msg: 'Invalid parameters: address'
    })
  }
  web3t.eth.getBalance(address).then(balance => {
    if (Number(balance) > 20000000) {
      return res.json({
        error: false,
        code: 22,
        from: '[POST /]',
        msg: 'Sufficient balance'
      })
    } else {
      sendTransaction(address, nonce++, res)
    }
  })
})

app.get('/nickname', (req, res) => {
  const code = req.query.code
  if (!code) {
    return res.sendStatus(400)
  }
  axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
    params: {
      appid: config.appid,
      secret: config.secret,
      code,
      grant_type: 'authorization_code'
    }
  }).then(token => {
    if (token.data.errcode) {
      console.log(token.data)
      return res.sendStatus(401)
    }
    return axios.get('https://api.weixin.qq.com/sns/userinfo', {
      params: {
        access_token: token.data.access_token,
        openid: token.data.openid,
        lang: 'zh_CN'
      }
    })
  }).then(userinfo => {
    if (!userinfo || userinfo.data.errcode) {
      console.log(userinfo.data)
      return res.sendStatus(401)
    }
    res.json({
      ok: true,
      openid: userinfo.data.openid,
      name: userinfo.data.nickname
    })
  })
})

app.get('/wx-sign', (req, res) => {
  let signUrl = encodeURIComponent(req.query.signUrl) 
  req.pipe(request(`http://sc.truescan.net/api/unauth/weixin/getWxSign?url=${signUrl}`)).pipe(res)
})


console.log('server listen on port 3000')
app.listen(3000)
