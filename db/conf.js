let conf = {
  host: 'localhost',//ip
  port: 3306,//端口
  database: 'hznu',//数据库名称
  user:     'hznu',
  // password: 'hznu-2022-liyang-???',
  // user:'root',//用户名
  password:'1234',//密码
  multipleStatements: true,//允许每个mysql语句有多条查询.使用它时要非常注意，因为它很容易引起sql注入攻击
  secret: 'hznu2022',
};

module.exports = conf;//使用module.exports导出模块：conf
