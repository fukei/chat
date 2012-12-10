// Client
var socket = io.connect('/');
var sessionid;
var count;

$(document).ready(function() {
  socket.on('connect', function(data) {
    sessionid = data;
    $('[name="userid"]').text(sessionid);
    console.log('sessionid', sessionid);
  });

  // count
  socket.on('counter', function(data) {
    count = data;
    $('#count').text('今だいたい' + count + '人' + 'が見ています').val();
  });

  // 接続時
  socket.on('index', function(data) {
    console.log('index');
    $("#name").val( $.cookie('name') );
    for (var i in data) {
      ts = new Date(data[i].date);
      yy = ts.getYear();
      mm = ts.getMonth() + 1;
      dd = ts.getDate();
      if (yy < 2000) { yy += 1900; }
      if (mm < 10) { mm = "0" + mm; }
      if (dd < 10) { dd = "0" + dd; }
      hh = ts.getHours();
      MM = ts.getMinutes();
      ss = ts.getSeconds();
      if (hh < 10) { hh = "0" + hh; }
      if (MM < 10) { MM = "0" + MM; }
      if (ss < 10) { ss = "0" + ss; }
      timestamp = yy + "/" + mm + "/" + dd + " " + hh + ":" + MM + ":" + ss;

      var first = $('#lv li:first');
      var name = data[i].name == undefined ? '名無し' : data[i].name;
      var msg = '<li id="' + data[i]._id + '">' + '<h3>'  
              + data[i].comment.replace(/\<script/g, '').replace(
                /(http:[^ ]*)(.*)/, '<a href=\"$1\" target="_blank">$1$2</a>')
              + '<h4>' + name + ' ' + timestamp + '  (ID: ' + data[i].userid 
              + ')' + '</h4></h3>' + '</a>' + '</li>';
      $('#lv').append(msg).listview("refresh");
    }
  });
  
  // コメント送信
  $('#title').keydown(function(event) {
    if (event.keyCode === 13) {
      if ($('#title').val().length < 1) {
        alert('コメントを入力して下さい');
        return false;
      }
      socket.emit('send', {
        userid: sessionid, 
        name: $('#name').val(),
        comment: $('#title').val(),
      });
      // クリア
      $('#title').val("");
      console.log('send');
      // クッキーに保存
      expires = new Date(Date.now() + 1800000 );
      document.cookie = "name=" + $('#name').val() +"; expires=" + expires + ";";
    }
  });

  // ブロードキャスト
  socket.on('sendall', function(chat) {
    ts = new Date();
    yy = ts.getYear();
    mm = ts.getMonth() + 1;
    dd = ts.getDate();
    if (yy < 2000) { yy += 1900; }
    if (mm < 10) { mm = "0" + mm; }
    if (dd < 10) { dd = "0" + dd; }
    hh = ts.getHours();
    MM = ts.getMinutes();
    ss = ts.getSeconds();
    if (hh < 10) { hh = "0" + hh; }
    if (MM < 10) { MM = "0" + MM; }
    if (ss < 10) { ss = "0" + ss; }
    timestamp = yy + "/" + mm + "/" + dd + " " + hh + ":" + MM + ":" + ss;
    
    var first = $('#lv li:first');
    var name = chat.name == undefined ? '名無し' : chat.name;
    var msg = '<li>' + '<h3>'  + chat.comment.replace(/<script/g, '').replace(
              /(http:[^ ]*)(.*)/, '<a href=\"$1\" target="_blank">$1$2</a>') 
            + '<h4>' + name + ' ' + timestamp + '  (ID: ' + chat.userid 
            +  ')' +'</h4></h3>' + '</li>';
    $('#lv').prepend(msg).prepend(first).listview("refresh");

    $.jwNotify({
      image : 'http://blog.earthyworld.com/wp-content/uploads/2012/04/message.png',
      title: chat.name,
      body:  chat.comment,
      timeout: 8000
    });

    console.log('sendall');
  });

  //more(要求)
  $('#more').click( function(event) {
      console.log("req more");
      var requestid =  $('#lv li').filter(':last').attr('id');
      socket.emit('more', {
        userid: sessionid, 
        requestid: requestid
      });
  });

  //more(応答)
  socket.on('more', function(data) {
      console.log('res more');
      for (var i in data) {
        ts = new Date(data[i].date);
        yy = ts.getYear();
        mm = ts.getMonth() + 1;
        dd = ts.getDate();
        if (yy < 2000) { yy += 1900; }
        if (mm < 10) { mm = "0" + mm; }
        if (dd < 10) { dd = "0" + dd; }
        hh = ts.getHours();
        MM = ts.getMinutes();
        ss = ts.getSeconds();
        if (hh < 10) { hh = "0" + hh; }
        if (MM < 10) { MM = "0" + MM; }
        if (ss < 10) { ss = "0" + ss; }
        timestamp = yy + "/" + mm + "/" + dd + " " + hh + ":" + MM + ":" + ss;

        var name = data[i].name == undefined ? '名無し' : data[i].name;
        var msg = '<li id="' + data[i]._id + '">' + '<h3>'  
                + data[i].comment.replace(/\<script/g, '').replace(
                  /(http:[^ ]*)(.*)/, '<a href=\"$1\" target="_blank">$1$2</a>')
                + '<h4>' + name + ' ' + timestamp + '  (ID: ' + data[i].userid 
                + ')' + '</h4></h3>' + '</a>' + '</li>';
        $('#lv').append(msg).listview("refresh");
      }
  });

  //バルス (meltdown.js http://d.hatena.ne.jp/KAZUMiX/20071105/meltdown)
  $('#options').click( function(event) {

      $.jwNotify({
	image : 'images/barusu.jpg',
	title: 'バルス',
	body: '（´ー｀ ）人 (´-｀)　ﾊﾞﾙｽ!!',
	timeout: 5000
      });
      
      // バルス
      alert('（´ー｀ ）人 (´-｀)　ﾊﾞﾙｽ!!');
      location.href = 'javascript:(function(){var s=document.createElement("script");s.charset="UTF-8";var da=new Date();s.src="javascripts/meltdown.js?"+da.getTime(); document.body.appendChild(s)})();';
  });
});

