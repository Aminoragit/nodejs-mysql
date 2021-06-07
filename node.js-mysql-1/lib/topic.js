var db = require('./db');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');

//1개면 module.exports  여러개면 걍 exports를 쓰면된다.
exports.home=function(request,response){
  db.query(`SELECT * FROM topic`, function(error, topics) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(topics);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
}


exports.page=function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, function(error, topics) {
    if (error) {
      throw error;
    }
    //WHERE에서 id만 쓰면 에러남 -> topic테이블의 id인지 author테이블의 id인지 불명확해서 그럼
    db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic) {
      if (error2) {
        throw error2;
      }
      // console.log(topic);
      var title = topic[0].title;
      var description = topic[0].description;
      var list = template.list(topics);
      var html = template.HTML(title, list,
        `
        <h2>${title}</h2>
        ${description}
        <p>by ${topic[0].name}</p>
        `,
        ` <a href="/create">create</a>
            <a href="/update?id=${queryData.id}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
            </form>`
      );
      response.writeHead(200);
      response.end(html);
    })
  });
}
exports.create=function(request,response){
  db.query(`SELECT * FROM topic`, function(error, topics) {
    db.query('SELECT * FROM author',function(error2,authors){
      var title = 'Create';
      var list = template.list(topics);
      var html = template.HTML(title, list,
        `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              ${template.authorSelect(authors)}
            <p>
              <input type="submit">
            </p>
          </form>
          `,
        `<a href="/create">create</a>`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
}
exports.create_process=function(request,response){
  var body = '';
  request.on('data', function(data) {
    body = body + data;
  });
  request.on('end', function() {
    //var qs = require('querystring');
    //Post로 전달된 query중 body부분을 파싱

    var post = qs.parse(body);
    //create_process 실행시 topic(table)에 데이터 입력하는 구문

    db.query(`
          INSERT INTO topic (title, description, created, author_id)
            VALUES(?, ?, NOW(), ?)`,
      [post.title, post.description, post.author],
      function(error, result) {
        if (error) {
          throw error;
        }
        //삽입한 행의 id값이 무엇인지를 알아야한다.
        //mysql nodejs insert id로 검색하면 나올것이다.
        //result.inserId임을 알수 있다.
        //create됬으면 생성된 id=값 으로 바로 redirect 해주는것
        //writeHead(302)가 발동되면 {Location:`~~~~~`로 자동 이동}
        response.writeHead(302, {
          Location: `/?id=${result.insertId}`
        });
        response.end();
      }
    )
  });
}
exports.update=function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
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
}
exports.update_process=function(request,response){
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
}
exports.delete_process=function(request,response){
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
}
