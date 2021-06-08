module.exports = {
  HTML:function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <a href="/author">author</a>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },list:function(topics){
    var list = '<ul>';
    var i = 0;
    while(i < topics.length){
      list = list + `
      <li>
        <a href="/?id=${topics[i].id}">${topics[i].title}</a>
      </li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },authorSelect:function(authors, author_id){
    //2가지 기능을 추가해준다 create와 다르게 update는 기존의 authors값을 변경해줘야하는데
    //이떄 체크박스에서 기존의 값을 우선적으로 보여줘야하므로 html 구문의 selected를 활용한다.
    //html이 표시될때 <option value="값" selected>로 되어있으면 html 로드시 해당 값을 최우선으로 보여준다.
    var tag = '';
    var i = 0;
    while(i < authors.length){
      var selected = '';
      if(authors[i].id === author_id) {
        selected = ' selected';
      }
      tag += `
      <option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
      i++;
    }
    return `
      <select name="author">
        ${tag}
      </select>
    `
  },authorTable:function(authors){
    var tag = '<table>';
    var i = 0;


    //주의 할점
    //DELETE를 할떄에는 반드시 href가 아닌 form 형식으로 해줘야 한다 반드시!!!
    while(i < authors.length){
        tag += `
            <tr>
                <td>${authors[i].name}</td>
                <td>${authors[i].profile}</td>
                <td><a href="/author/update?id=${authors[i].id}">update</a></td>
                <td>
                  <form action="/author/delete_process" method="post">
                      <input type="hidden" name="id" value="${authors[i].id}">
                      <input type="submit" value="delete">
                   </form>
                </td>
            </tr>
            `
        i++;
    }
    tag += '</table>';
    return tag;
  }
}
