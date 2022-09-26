var express = require('express');// 引入 Express 模块
var axios = require('axios');//axios是用来发送Ajax请求的，可以运行在浏览器和Node.js环境中。
var fs = require('fs');//fs是filesystem的缩写，该模块提供本地文件的读写能力，基本上是POSIX文件操作命令的简单包装
var path = require('path')//Node.js path 模块提供了一些用于处理文件路径的小工具
var jwt = require('jsonwebtoken')//加载包
var formidable = require('formidable')//常用第三方模块包formidable来处理客户端以POST方式提交的表单、文件、图片等
var router = express.Router()// 创建一个路由容器
var dayjs = require('dayjs')//Day.js 是一个轻量的处理时间和日期的 JavaScript 库
var db = require("../db/db")
//__dirname指的是当前文件所在文件夹的绝对路径
// console.log(__dirname)  输出D:\Program\program\hznu-course-select\server\routes
var root = path.resolve(__dirname,'../')//path.resolve() 方法会把一个路径或路径片段的序列解析为一个绝对路径。
//console.log(root) 输出D:\Program\program\hznu-course-select\server
//拷贝函数
var clone =(e)=> {
  //JSON.parse(JSON.stringify(obj))我们一般用来深拷贝，其过程就是利用JSON.stringify 将js对象序列化（JSON字符串），再使用JSON.parse来反序列化(还原)js对象；
  return JSON.parse(JSON.stringify(e))
}

const SECRET_KEY = 'ANSAIR-SYSTEM'//加密密钥

var JSZip = require("jszip");
var zip = new JSZip();
//docx
//导出docx
var PizZip = require('pizzip')
var Docxtemplater = require('docxtemplater')


function loadFile (url, callback) {
  PizZipUtils.getBinaryContent(url, callback)
  }

  var expressions = require("angular-expressions");
  var assign = require("lodash/assign");
  // define your filter functions here, for example
  // to be able to write {clientname | lower}
  expressions.filters.lower = function (input) {
      // Make sure that if your input is undefined, your
      // output will be undefined as well and will not
      // throw an error
      if (!input) return input;
      return input.toLowerCase();
  };
  function angularParser(tag) {
    tag = tag
        .replace(/^\.$/, "this")
        .replace(/(’|‘)/g, "'")
        .replace(/(“|”)/g, '"');
    const expr = expressions.compile(tag);
    return {
        get: function (scope, context) {
            let obj = {};
            const scopeList = context.scopeList;
            const num = context.num;
            for (let i = 0, len = num + 1; i < len; i++) {
                obj = assign(obj, scopeList[i]);
            }
            return expr(scope, obj);
        },
    };
}

function readDir(zip, dirPath) {
  // 读取dist下的根文件目录
  const files = fs.readdirSync(dirPath); 
  files.forEach(fileName => {
    const fillPath = dirPath + "/" + fileName;
    const file = fs.statSync(fillPath);
    // 如果是文件夹的话需要递归遍历下面的子文件
    if (file.isDirectory()) {
      const dirZip = zip.folder(fileName);
      readDir(dirZip, fillPath);
    } else {
      // 读取每个文件为buffer存到zip中
      zip.file(fileName, fs.readFileSync(fillPath));
    }
  });
}

function generateZip() {
  const sourceDir = path.join(__dirname, "../export");
  readDir(zip, sourceDir);
  zip.generateAsync({
    type: "nodebuffer", // 压缩类型
    compression: "DEFLATE", // 压缩算法
    compressionOptions: { // 压缩级别
      level: 9
    }
  }).then(content => {
    const dest = path.join(__dirname, "../build");
    // 创建新包目录
    fs.mkdirSync(dest, {
      recursive: true
    });
    // 把zip包写到硬盘中，这个content现在是一段buffer
    fs.writeFileSync(path.resolve(dest, 'hznu.zip'), content); 
  });
}

var callSQLProc = (sql, params, res) => {
  return new Promise (resolve => {
    db.procedureSQL(sql,JSON.stringify(params),(err,ret)=>{
      if (err) {
        res.status(500).json({ code: -1, msg: '提交请求失败，请联系管理员！', data: null})
      }else{
        resolve(ret)
      }
    })
  })
}

var callP = async (sql, params, res) => {
  return  await callSQLProc(sql, params, res)
}


var decodeUser = (req)=>{
  let token = req.headers.authorization
  return  JSON.parse(token.split(' ')[1])
}


router.post('/login',async (req, res, next) =>{
  let params = req.body
  let sql = `CALL PROC_LOGIN(?)`
  let r = await callP(sql, params, res)
  if (r.length > 0) {
    let ret = clone(r[0])
    let token = jwt.sign(ret, SECRET_KEY)
    res.status(200).json({code: 200, data: ret, token: token, msg: '登录成功'})
  } else {
    res.status(200).json({code: 301, data: null, msg: '用户名或密码错误'})
  }
})


router.post('/qryCls', async (req, res, next) =>{
  let uid = decodeUser(req).uid
  let params = {uid:uid}
  let sql= `CALL PROC_QRY_CLS(?)`
  let r = await callP(sql, params, res)
  res.status(200).json({ code: 200, data: r })
});

router.post('/qryClsMain', async (req, res, next) =>{
  let uid = decodeUser(req).uid
  // uid="20050027";
  let params = {uid:uid, code: req.body.code}

  // console.log(params)
  let sql1= `CALL PROC_QRY_CLS_MAIN(?)`
  let sql2= `CALL PROC_QRY_TECH(?)`
  let sql3= `CALL PROC_QRY_EXP(?)`
  let r = await callP(sql1, params, res)
  let s = await callP(sql2, params, res)
  let t = await callP(sql3, params, res)
  res.status(200).json({ code: 200, data: r, tecList:s, expList:t })
});


router.post('/savCls', async (req, res, next) =>{
  let uid = decodeUser(req).uid
  req.body.uid = uid
  let params = req.body
  let sql1= `CALL PROC_SAV_CLS(?)`
  let sql2= `CALL PROC_SAV_TECH(?)`
  let sql3= `CALL PROC_SAV_EXP(?)`
  let r = await callP(sql1, params, res)
  let s = await callP(sql2, params, res)
  let t = await callP(sql3, params, res)
  res.status(200).json({ code: 200, data: r, tecList:s, expList:t })
});

//输出docx

doExport=async(data)=>{
      let content = fs.readFileSync(path.resolve(__dirname, '../public/hznu.docx'), 'binary');
			  let zip = new PizZip(content);
        var doc=new Docxtemplater(zip, { parser: angularParser })
        for(let key in data) {  data[key] = (data[key] === null)?'':data[key] }
			  doc.setData(data);
			  try { doc.render() } catch (error) { errorHandler(error); }
			  var buf = doc.getZip().generate({ type: 'nodebuffer' });
			  fs.writeFileSync(path.resolve(__dirname, `../export/${data.clsDetail[0].name}_${data.clsDetail[0].uname}.docx`), buf);
}

router.post('/output', async (req, res, next) =>{
  let sql= `CALL PROC_OUTPUT()`
  let r = await callP(sql)
  let str=[];
  for(let i=0;i<r.length;i++) {
    let flag=true;
    str[i]=r[i].code
		if(str[i]===str[i-1]){
				flag=false;
		}
    let params = { uid:r[i].uid,code: r[i].code}
    let sql2= `CALL PROC_QRY_CLS_MAIN(?)`
    let sql3= `CALL PROC_QRY_TECH(?)`
    let sql4= `CALL PROC_QRY_EXP(?)`
    let r1 = await callP(sql2,params, res)
    let s = await callP(sql3, params, res)
    let t = await callP(sql4, params, res)
    
    let data={clsDetail: r1, tecList:s, expList:t};
    data.clsDetail[0].w_hour=data.clsDetail[0].t_hour+data.clsDetail[0].e_hour;//周学时赋值
    data.clsDetail[0].a_hour=data.clsDetail[0].w_hour*16;
    if(flag){
      doExport(data);
    }
  }

  //  // 读取每个文件为buffer存到zip中
  //  zip.file("hrll.docx",fs.readFileSync(path.resolve(__dirname, '../public/hznu.docx')));
	// 	zip.generateAsync({type:"nodebuffer"})
	// 	.then(function(content) {
  //     console.log(content)
  //   	fs.writeFileSync(`zdx2.zip`, content);
	// 	});
  generateZip();
  res.status(200).json({
    code: 200,
    data:r,
    msg: '输出docx成功了哦'
   })
 
});

// 上传文件
router.post('/upload', function (req, res) {
  const form = formidable({uploadDir: `${__dirname}/../img`});

  form.on('fileBegin', function (name, file) {
    file.filepath = `img/sys_${dayjs().format('YYYYMMDDhhmmss')}.jpeg`
  })
 
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    res.status(200).json({
      code: 200,
      msg: '上传照片成功',
      data: {path: files.file.filepath}
    })
  });
})


module.exports = router