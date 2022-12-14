const mysql = require('mysql');//引入mysql
const config = require("./conf.js")//引入conf模块并且命名为config
const pool = mysql.createPool(config);
//createPool创建连接池连接数据库

var prepareParm = (obj, nl, vl, el)=> {
  for(let key in obj) {
    let val = obj[key]
    console.log('typeof(val).............'+ typeof(val))
    nl.push(key)
    if (typeof(val)==='string') {
      vl.push(`'${val}'`)
      el.push(`${key}='${val}'`)
    }else if (val instanceof Array) {
      vl.push(`'${val.join('|')}'`)
      el.push(`${key}='${val}'`)
    }else{
      vl.push(`${val}`)
      el.push(`${key}=${val}`)
    }
  }
}



var selectPage = async (table, whereSql, orderSql, pageIndex=1, size=10, cb)=>{
  pool.getConnection((err, conn)=>{
    if (err) {
      console.log('Connect error', err )
    } else {
      let sql = `select * from ${table} ${whereSql} ${orderSql} limit ${(pageIndex-1)*size}, ${size}`
      conn.query(sql,  ( err, rows) => {
        if ( err ) {
          console.log('SQL error', err )
        } else {
          cb( err, rows )
        }
        conn.release()
      })
    }
  })
};




var select = async (table, where, order, limit, cb)=>{
  pool.getConnection((err, conn)=>{
    if (err) {
      console.log('Connect error', err )
    } else {
      let sql = `select * from ${table} ${where} ${order} ${limit}`

      console.log(sql)
      conn.query(sql,  ( err, rows) => {
        if ( err ) {
          console.log('SQL error', err )
        } else {
          cb( err, rows )
        }
        conn.release()
      })
    }
  })
};

var selectSP = async (select, table, where, order, limit, cb)=>{
  pool.getConnection((err, conn)=>{
    if (err) {
      console.log('Connect error', err )
    } else {
      let sql = `select ${select} from ${table} ${where} ${order} ${limit}`

      console.log(sql)
      conn.query(sql,  ( err, rows) => {
        if ( err ) {
          console.log('SQL error', err )
        } else {
          cb( err, rows )
        }
        conn.release()
      })
    }
  })
};

var selectAll = async (table, cb)=>{
  pool.getConnection((err, conn)=>{
    if (err) {
      console.log('Connect error', err )
    } else {
      let sql = `select * from ${table}`
      conn.query(sql, ( err, rows) => {
        if ( err ) {
          console.log('SQL error', err )
        } else {
          cb( err, rows )
        }
        conn.release()
      })
    }
  })
};


var del = async (table, where, cb)=>{
  pool.getConnection((err, conn)=>{
    if (err) {
      console.log('Connect error', err )
    } else {
      let whereSql  = []
      prepareParm(where,[],[],whereSql)
      whereSql = whereSql.join(' and ')
      let sql = `delete from ${table} where ${whereSql}`
      console.log(sql)
      conn.query(sql, ( err, rows) => {
        if ( err ) {
          console.log('SQL error', err )
        } else {
          cb( err, rows )
        }
        conn.release()
      })
    }
  })
};


var add = async (table, params, cb)=>{
  pool.getConnection((err, conn)=>{
    if (err) {
      console.log('Connect error', err )
    } else {
      let fieldList = []
      let valList = []
      prepareParm(params,fieldList,valList,[])
      sql = `insert into ${table} (${fieldList.join(',')}) values(${valList.join(',')})`;
      console.log(sql)
      conn.query(sql, ( err, rows) => {
        if ( err ) {
          console.log('SQL error', err )
          cb( err, { code: 1, msg: '数据添加失败！' } )
        } else {
          cb( err, { code: 0, msg: '数据添加成功！', rows:rows} )
        }
        conn.release()
      })
    }
  })
};


var querySQL = async (sql, cb)=>{
  var conn = mysql.createConnection(config);
  conn.query(sql, function (err, ret, fields) {
    if ( err ) {
      console.log('SQL error', err )
      cb( err, { code: 1, msg: '保存失败！'} )
    } else {
      cb( err, { code: 0, msg: '保存成功！'} )
    }
    conn.end();
  });
};

var procedureSQL = async (sql, params, cb)=>{
  var conn = mysql.createConnection(config);//创建连接
  //conn.query(sqlStr[,params],callback)
  //sqlStr:要执行的sql语句，可以使用占位符
  //params:参数列表，数组
  //callback:回调函数，第一个参数：异常对象；第二个参数：结果对象
  conn.query(sql, params, function (err, ret, fields) {
    if ( err ) {
      console.log('SQL error', err )
      cb( err, ret )
    } else {
      //cb的在js中是call-back 也就是回调函数的缩写
      cb( err, ret[0])
    }
    //只有当您停止向MySQL发送查询时,即当您的应用程序停止时,才会调用conn.end()
    conn.end();
  });
};




var vertifyUser = async (params, cb) => {

  let where = `where email='${params.email}' and pwd='${params.pwd}'`
  select('account',where,'','', (err,ret)=>{
    if (ret.length > 0) {
      cb(err,true) 
    }else{
      cb(err,false) 
    }
  })
}



exports.select     = select;
exports.selectSP     = selectSP;
exports.selectAll  = selectAll;
exports.selectPage = selectPage;
exports.querySQL   = querySQL;
exports.add        = add;
exports.procedureSQL     = procedureSQL;
exports.del        = del;
exports.prepareParm= prepareParm;
exports.vertifyUser= vertifyUser;