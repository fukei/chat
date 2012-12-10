
/**
 * Module dependencies.
 */

// SSL commentout
//var PORT    = 10445;
var PORT    = 3333;
var SSL_KEY = './ssl/ryans-key.pem';
var SSL_CERT= './ssl/ryans-cert.pem';

var express = require('express')
  , routes = require('./routes')
  , cookies = require('cookies')
  , mongoose = require('mongoose')
  , fs = require('fs');

var MemoryStore = express.session.MemoryStore
  , sessionStore = new MemoryStore();

/* SSL commentout
var options = {
  key: fs.readFileSync(SSL_KEY),
  cert:fs.readFileSync(SSL_CERT)
};
*/

// SSL commentout 
//var app = module.exports = express.createServer(options);
var app = module.exports = express.createServer();

/* SSL commentout
var http = express.createServer();
http.get('*',function(req,res){
  res.redirect('https://ukh.jp:10445');
});
http.listen(3333);
*/

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'ukh.jp' 
   ,store: sessionStore
   ,maxAge: 60000
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.listen(PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// counter
var count = 0;

// mongoose
var Schema = mongoose.Schema
  ,ObjectId = Schema.ObjectId;
var ChatSchema = new Schema({
  chatid: ObjectId,
  userid: String,
  name: String,
  comment: String,
  date: { type: Date, default: Date.now }
});
mongoose.model('Chat', ChatSchema);
mongoose.connect('mongodb://localhost/chat');

// socket.io
var io = require('socket.io').listen(app);

// cookieParser
var connect = require('connect')
  , parseCookie = connect.utils.parseCookie
  , Session = connect.middleware.session.Session;

io.configure(function() {
  io.set('authorization', function(handshakeData, callback){
    if(handshakeData.headers.cookie){
      // get cookie from handshakeData
      var cookie = handshakeData.headers.cookie;
      // parse and get express.sid
      // session for Express
      var sessionID = parseCookie(cookie)['connect.sid'];
      // store data
      handshakeData.cookie = cookie;
      handshakeData.sessionID = sessionID;
      handshakeData.sessionStore = sessionStore;
      // get session from storage
      sessionStore.get(sessionID, function(err, session){
        if(err) {
          console.log('no session');
          // can't get session
          callback(err.message, false);
        } else {
          console.log('get session');
          // store session
          // new session object
          handshakeData.session = new Session(handshakeData, session);
          callback(null, true);
        }
      });
    } else {
      return callback('Cookie is not found', false);
    }
  });
});

io.sockets.on('connection', function(socket) {
  console.log('connection');

  var handshake = socket.handshake;
  console.log('sessionID is', handshake.sessionID);

  // restore session
  var intervalID = setInterval(function() {
    // reload session
    handshake.session.reload( function() {
      // restore lastAccess and maxAge
      handshake.session.touch().save();
    });
  }, 1000*6);

  // counter
  count++;
  socket.emit('counter', count);
  socket.broadcast.emit('counter', count);

  var crypto = require('crypto')
    , md5sum = crypto.createHash('md5')
    , sessionid = handshake.sessionID;
  var sessionid_md5 = md5sum.update(sessionid).digest('hex');
  socket.emit('connect', sessionid_md5);

  var Chat = mongoose.model('Chat');
  Chat.find({}, {}, { sort: {date: -1}, limit: 10 }, function(err, docs) {
    console.log(err);
    console.log('docs');
    socket.emit('index', docs);
  });

  // recv send message
  socket.on('send', function(receive) {
    console.log('receive');
    var chat = new Chat();
    chat.chatid = chat.ObjectId;
    chat.userid = receive.userid;
    chat.name   = receive.name;
    chat.comment  = receive.comment;
    // strip script tags
    chat.comment  = chat.comment.replace(/<script/g, '');
    console.log('chat');
    chat.save(function(err) {
      if (err) { console.log(err); }
    });
    // @todo 自分自身にメッセージ返す必要は...
    socket.emit('sendall', chat);
    // broadcast
    socket.broadcast.emit('sendall', chat);
    console.log('sendall');
  });


  // more(index)
  socket.on('more', function(receive) {
    console.log('receive more');
    console.log(receive);

    var Chat = mongoose.model('Chat');
    Chat.find({ _id: { $lt: receive.requestid } }, {}
                   , { sort: {date: -1}, limit: 5}, function(err, chat) {
      console.log(err);
      console.log(chat);

      socket.emit('more', chat);

    });
  });

  // disconnect count
  socket.on('disconnect', function() {
    // session
    console.log('sessionID is', handshake.sessionID, 'disconnected');
    // stop reload session
    clearInterval(intervalID);

    // counter
    count--;
    socket.broadcast.emit('counter', count);
  });

});
