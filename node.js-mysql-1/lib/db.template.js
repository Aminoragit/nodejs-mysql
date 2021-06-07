//버전 관리용 초기값

var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: '',
  password: '',
  database: ''
});

//가장 중요
db.connect();
module.exports = db;
