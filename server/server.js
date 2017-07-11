var path = require('path')
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var db = require('./db')
var PORT = process.env.PORT || 3000
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var multer = require('multer');


//
//  Server chat
//
var usersBySocket = {}; // { socketId:{ info:dbUser,socket:socket}}}
var usersByDB = {};
io.on('connection', function(socket) {

  var sendUserList = function() {
    var userArray = Object.keys(usersBySocket).map(function(key) {
      return usersBySocket[key].info;
    });
    io.emit('userListUpdate', userArray);
  }

  socket.on('message', function(msg) {
    var user = usersBySocket[socket.id];
    msg.senderId = user.info._id

    console.log(msg);
    if( msg.roomId=="global" || !msg.roomId ) {
      //Global Message, Send to everyone including the sender
      io.emit('message', msg);
      db.insertMessageGlobal(msg);
    } else {
      //Private Message
      var user = usersByDB[msg.roomId];
      if( user ){
        user.socket.emit('message', msg); // Send to the recipent
      }
      socket.emit('message', msg); // Send back to the sender (they they know it was sent)
      db.insertMessagePrivate(msg);
    }
  });

  socket.on('setUserInfo',function(info){
    usersByDB[info._id] = 
    usersBySocket[socket.id] = { info:info, socket:socket };

    db.findMessagePrivateByUser( info._id,function(err,data){
      socket.emit('messages', data);
    });
    db.findMessageGlobal({},function(err,data){
      socket.emit('messages', data);
    });
    sendUserList();
  });

  socket.on('disconnect', function() {
    var user = usersBySocket[socket.id];
    if( user && user.info ) {
      delete usersByDB[user.info._id];
    }
    delete usersBySocket[socket.id];
    sendUserList();
  });

});


//
//  Web Server
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')))

db.connect(function(err){
  if( err ) return;
  http.listen(PORT, function () {
    console.log('Listening on port', PORT)
  })
});

var login = function(user,res) {
  console.log("Store", user._id);
  delete user['password'];
  res.cookie('auth', user._id, { path: '/' });
  res.send({status:"success",'user':user});
}

app.post('/user', function (req, res) {
  db.findUsers({email:req.body.email},function(err,data){
    if( !err && data && data.length==0 ) {
      db.insertUser( req.body,function(err,user){
        login(data,res);
      });
    } else {
      res.send({status:"error",msg:"Email Already Exists"});
    }
  });
});

app.post('/auth', function (req, res) {
  db.findUsers({email:req.body.email,password:req.body.password},function(err,data){
    if( data.length>0 ) {
      login( data[0], res );
    } else {
      res.send({status:"error",msg:"Invalid info. Please Try Again."});
    }
  });
});

app.post('/upload', multer({dest: 'public/upload/'}).single('file'), function(req, res) {
  console.log(req.cookies);
  res.send(req.file);
  db.insertFile({
    userId:req.cookies['auth'],
    date:new Date(),
    promoId:'default'
  },function(err,data){
    console.log("added",data);
  });
});



