var http = require('http');
// var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var topic = require('./lib/topic');
// var path = require('path');
// var sanitizeHtml = require('sanitize-html');

//1. mysql을 실행
//2.db를 호출
var db = require('./lib/db');



var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === '/') {
    if (queryData.id === undefined) {
      //lib/topic.js로 정리정돈
      topic.home(request,response);
    } else {
      topic.page(request,response);
    }

  } else if (pathname === '/create') {
    topic.create(request,response);

  } else if (pathname === '/create_process') {
    topic.create_process(request,response);

  } else if (pathname === '/update'){
      topic.update(request,response);

  } else if (pathname === '/update_process'){
      topic.update_process(request,response);

  } else if (pathname === '/delete_process') {
    topic.delete_process(request,response);
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
