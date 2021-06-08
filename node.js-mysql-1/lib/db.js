var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'opentutorials'
  //bultipleStatements:true <-SQL문 입력을 여러개 할수 있게 하는것
  //기본값은 false이니 sql injection 당하기 싫으면 괜히 건들지 말자.

});

//가장 중요
db.connect();
module.exports = db;
