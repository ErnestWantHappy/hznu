var http = require('http')
var https = require('https')
var fs = require('fs')
var path = require('path')
var cors = require('cors')
var dayjs = require('dayjs')
var axios = require('axios')
var dotenv = require('dotenv')//使用dotenv，只需要将程序的环境变量配置写在.env文件中。
var express = require('express')
var bodyParser = require('body-parser')
var compression = require('compression')

dotenv.config()

const port = 8080
// const port = 80
const app = express()

app.use(cors())//它启用了 CORS (跨域资源共享).为了使您的服务器可以被其他来源(域)访问.
app.use(compression())
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))


app.use(express.static(__dirname+"/build"));
// app.use(express.static(__dirname));
var router = require('./routes/index')
app.use('/', router);


// var options = {
//   key: fs.readFileSync('./key/site.key'),
//   cert:fs.readFileSync('./key/site.pem')
// }

// 监听端口
var server  = http.createServer(app).listen(port)
// var servers = https.createServer(options,app).listen(443)






server.on('error', onError)
server.on('listening', ()=>{ console.log('Listening on Port 80') })

function onError(error) {
  if (error.syscall !== 'listen') { throw error; }
  switch (error.code) {
    case 'EACCES':
      console.error('Port 80 requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port 80 is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
