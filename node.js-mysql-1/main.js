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
      db.query('SELECT * FROM topic', function(error, topics){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error2){
            throw error2;
          }
          db.query('SELECT * FROM author', function(error2, authors){
            var list = template.list(topics);
            var html = template.HTML(topic[0].title, list,
              `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                  ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          });

        });
      });
  } else if (pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          // var id = post.id;
          // var title = post.title;
          // var description = post.description;
          // fs.rename(`data/${id}`, `data/${title}`, function(error) {
          //   fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          //     console.log(result);
          //     response.writeHead(302, {
          //       Location: `/?id=${title}`
          //     });
          //     response.end();
          //   })
          // });
          //기존의 쿼리에 author를 추가해준다.
          db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?', [post.title, post.description, post.author, post.id], function(error, result){
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
          })
      });

  } else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function(data) {
      body = body + data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      // var id = post.id;
      // var filteredId = path.parse(id).base;
      db.query('DELETE FROM topic WHERE id = ?',[post.id],function(error,result){
        if(error){
          throw error;
        }
        //error가 안나고 삭제가 정상적으로 되었다면 홈페이지로 이동)localhost:3000
        response.writeHead(302, {Location: `/`});
        response.end();
      });
      // fs.unlink(`data/${filteredId}`, function(error) {
      //   response.writeHead(302, {
      //     Location: `/`
      //   });
      //   response.end();})
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
