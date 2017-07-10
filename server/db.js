var
  // Requires
  MongoClient      = require('mongodb').MongoClient,
  shortid          = require('shortid'),
  // Constants
  DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/promo-chat';



var db = null;


exports.connect = function(callback) {
  console.log('  Connecting to Mongo (' + DB_URL + ')..... ');
  MongoClient.connect(DB_URL, function(err, dbCon) {
    if ( err ) {
      console.log(err);
      callback(err);
      return;
    }
    console.log('  Connected');

    db = dbCon;
    db.user = db.collection('user');
    db.messagePrivate = db.collection('messagePrivate');
    db.messageGlobal = db.collection('messageGlobal');
    db.file = db.collection('file');
    callback();
  });
};

//
//  User
//
exports.insertUser = function(user,callback){
  user._id = shortid.generate();
  db.user.insert(user,function(err,ref){
    if( err ) {
      console.log(err);
      callback(err);
      return;
    }
    callback(null,ref.ops[0]);
  });
}
exports.updateUser = function(user,callback){
  db.user.update({_id:user._id},{"$set":user},function(err){
    if( err ) {
      console.log(err);
      callback(err);
      return;
    }
    callback(null);
  });
}
exports.findUsers = function(query,callback){
  db.user.find(query).toArray(function(err,data){
    callback(err,data);
  })
}


//
//  Messages
//
exports.insertMessagePrivate = function(msg,callback){
  msg._id = shortid.generate();
  db.messagePrivate.insert(msg,function(err,ref){
    if( err ) {
      console.log(err);
      callback && callback(err);
      return;
    }
    callback && callback(null,ref.ops[0]);
  });
}
var findMessagePrivate = function(query,callback){
  exports.findMessagePrivate
  db.messagePrivate.find(query).toArray(function(err,data){
    callback(err,data);
  })
}
exports.findMessagePrivate = findMessagePrivate;
exports.findMessagePrivateByUser = function(userId,callback){
  var query = {
      "$or": [{
          "roomId": userId
      }, {
          "senderId": userId
      }]
  };
  findMessagePrivate(query, callback);
}
exports.insertMessageGlobal = function(msg,callback){
  msg._id = shortid.generate();
  db.messageGlobal.insert(msg,function(err,ref){
    if( err ) {
      console.log(err);
      callback && callback(err);
      return;
    }
    callback && callback(null,ref.ops[0]);
  });
}
exports.findMessageGlobal = function(query,callback){
  db.messageGlobal.find(query).toArray(function(err,data){
    callback(err,data);
  })
}

//
//  Uploads
//
exports.insertFile = function(obj,callback){
  obj._id = shortid.generate();
  db.file.insert(obj,function(err,ref){
    if( err ) {
      console.log(err);
      callback && callback(err);
      return;
    }
    callback && callback(null,ref.ops[0]);
  });
}
exports.findFile = function(query,callback){
  db.file.find(query).toArray(function(err,data){
    callback(err,data);
  })
}
