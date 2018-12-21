var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var https = require("https");
var fs = require("fs");
var path = require("path");
var sign = require("./sign.js");
const config = require("./config.json");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// 定时任务 服务器每隔90分钟获取一次access_token 和jsapi_ticket
var duration = 1000 * 60 * 90; // 请求的时间间隔 毫秒
var interval = setInterval(function() {
  refreshAct();
  setTimeout(function() {
    refreshJst();
  }, 1000 * 60);
}, duration);

// // …
// clearInterval(interval);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "www" });
});

// 验证微信服务器配置 和微信推送消息的地址
router.get("/receive", function(req, res) {
  var tmp = req.query;
  // console.log(tmp);
  res.send(tmp.echostr);
});

// 接受 和返回给微信服务器推送过来的消息 以免微信对我这边一个接口重试5次
router.post("/receive", function(req, res) {
  console.log("receive post");
  // console.log(req.body);
  res.send("success");
});

//微信网页授权accesstoken 获取用户openid  （服务号）
router.get("/wx-wysq-user-info-base", function(req, res) {
  var code = req.query.code; //console.log(code); console.log(req.query);
  var yewuye = req.query.state; //console.log(yewuye);

  var search_str = new String(yewuye);
  search_str = search_str.substr(search_str.indexOf("?")); //console.log(search_str);
  var keyis = getParam(search_str, "keyis");
  console.log(keyis);

  var appid = "wx442ea0e9f7102adf";
  var appsecret = "ce795419487e25a478306944418d3161";
  var opts = {
    host: "api.weixin.qq.com",
    port: "443",
    path:
      "/sns/oauth2/access_token?appid=" +
      appid +
      "&secret=" +
      appsecret +
      "&code=" +
      code +
      "&grant_type=authorization_code",
    method: "GET"
  };
  // return res.json({xx:'xx'});
  https_req(opts, function(d) {
    d = JSON.parse(d);
    // console.log(d.openid);
    res.redirect(yewuye + "&" + keyis + "=" + d.openid);
  });
});

//用于 微信js sdk调用的配置 (签名等)
router.post("/getjscfg", function(req, res) {
  var tmp = fs.readFileSync(
    path.join(__dirname, "wechat_data/jsapi_ticket.js")
  );
  tmp = tmp.toString();
  tmp = JSON.parse(tmp); // console.log(tmp);

  var jsapi_ticket = tmp["fuwuhao"].ticket;
  var url = req.body.url;
  var info = sign(jsapi_ticket, url);
  // info = JSON.stringify(info);
  res.set("Access-Control-Allow-Origin", "*");  
  res.json(info);
});

//用于中控服务器统一获取access_token
router.get("/getact", function(req, res) {
  var tmp = fs.readFileSync(
    path.join(__dirname, "wechat_data/access_token.js")
  );
  tmp = tmp.toString();
  tmp = JSON.parse(tmp);
  res.json(tmp);
});

//用于向中控服务器统一刷新access_token
router.get("/react", function(req, res) {
  refreshAct();
  res.send("ok");
});

//用于中控服务器获取jsapi_ticket
router.get("/getjst", function(req, res) {
  var tmp = fs.readFileSync(
    path.join(__dirname, "wechat_data/jsapi_ticket.js")
  );
  tmp = tmp.toString();
  tmp = JSON.parse(tmp);
  // tmp = JSON.stringify(tmp);
  res.json(tmp);
});

//用于中控服务器统一刷新jsapi_token
router.get("/rejst", function(req, res) {
  refreshJst();
  res.send("ok");
});

//  向微信发请求获取 access_token
function refreshAct() {
  // 账号信息
  var appid = config.appid;
  var appsecret = config.secret;
  var host = "api.weixin.qq.com";
  var opts = {
    host: host,
    port: "443",
    path:
      "/cgi-bin/token?grant_type=client_credential&appid=" +
      appid +
      "&secret=" +
      appsecret,
    method: "GET"
  };

  var datas = {};

  https_req(opts, function(d) {
    d = JSON.parse(d);
    datas.fuwuhao = d;
    var data = JSON.stringify(datas);
    fs.writeFileSync(
      path.join(__dirname, "wechat_data/access_token.js"),
      data
    );
  });
}

// 向微信服务器发请求获取 获取jsapi_ticket
function refreshJst() {
  var tmp = fs.readFileSync(
    path.join(__dirname, "wechat_data/access_token.js")
  );
  tmp = tmp.toString();
  tmp = JSON.parse(tmp);
  var ticks = {};

  var act_fu = tmp["fuwuhao"].access_token;
  // console.log(act_din);console.log('xx'+'\n');console.log(act_fu);
  var host = "api.weixin.qq.com";
  var opts_fu = {
    host: host,
    port: "443",
    path: "/cgi-bin/ticket/getticket?access_token=" + act_fu + "&type=jsapi",
    method: "GET"
  };

  https_req(opts_fu, function(d) {
    d = JSON.parse(d);
    // console.log(d);
    ticks.fuwuhao = d;
    ticks = JSON.stringify(ticks); //console.log(ticks);
    fs.writeFileSync(
      path.join(__dirname, "wechat_data/jsapi_ticket.js"),
      ticks
    );
  });
}

function https_req(op, callback) {
  var reqq = https.request(op, function(ress) {
    ress.setEncoding("utf8");
    var tmp = "";
    ress.on("data", function(d) {
      tmp += d;
      callback(d);
    });
  });

  reqq.end();

  reqq.on("error", function(e) {
    console.error(e);
  });
}

function getParam(search, key) {
  var tmp = search;
  tmp = decodeURIComponent(tmp);
  var index = tmp.indexOf(key);
  var length = key.length;
  var value;
  if (index != -1) {
    var start = index + length + 1;
    var end = tmp.indexOf("&", start);
    if (end == -1) {
      value = tmp.slice(start);
    } else {
      value = tmp.slice(start, end);
    }
  } else {
    value = "";
  }
  return value;
}

module.exports = router;
