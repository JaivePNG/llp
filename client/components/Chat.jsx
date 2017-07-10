import React from 'react'
import io from "socket.io-client"
import update from 'immutability-helper'
import UserList from './UserList'
import RoomList from './RoomList'

export default class Chat extends React.Component {

  propTypes: {
    user: React.PropTypes.object,
    onLogout: React.PropTypes.func
  }

  constructor(props) {
    super(props);

    this.globalRoom = {
      _id:'global',
      name:'Chat Lobby',
      messages:[]
    };

    this.state = {
      msg:"",
      users:[],
      room:this.globalRoom,
      rooms:{}
    };
    this.state.rooms[this.state.room._id] = this.state.room;

    var self = this;
    this.socket = io.connect();
    this.socket.on('message', function(msg){
      self.onRecievedMessage(msg);
    });
    this.socket.on('messages', function(msgArray){
      // Bulk load.. happens when they first log in
      msgArray.forEach(function(msg){
        self.onRecievedMessage(msg);
      })
    });
    this.socket.on('userListUpdate', function(users){
      self.onUserListUpdate(users);
    });
    this.socket.on('connect',function(socket){
      self.socket.emit("setUserInfo",{
        _id:self.props.user._id,
        name:self.props.user.name
      });
    });
  }


  //
  //  Events
  //

  onLogout(e) {
    this.socket.disconnect();
    e.preventDefault();
    this.props.onLogout && this.props.onLogout(e.target, e.target.value, e);
  }

  onMessageSend(e) {
    e.preventDefault();
    if( !this.state.msg ) 
      return;

    this.sendMessage({
      value:this.state.msg
    })
    this.setState( (state) => update(state, {msg:{$set:""}}) );
  }

  onMessageChange(e) {
    this.state.msg = e.target.value;
    this.setState( this.state );
  }

  onRecievedMessage(msg) {
    // Don't just set a new array. That will redraw the whole thing
    var sentDirectToMe = msg.roomId==this.props.user._id;
    var roomId = sentDirectToMe ? msg.senderId : msg.roomId;
    msg.isSender = msg.senderId==this.props.user._id;

    if(!this.state.rooms[roomId]) {
      this.state.rooms[roomId] = {
        _id:roomId,
        name:(msg.isSender? msg.roomName : msg.name ),
        messages:[]
      };
    }
    var room = this.state.rooms[roomId];

    if( msg._id ) {
      var isInArray = room.messages.find(function(x){
        return x._id === msg._id;
      });
      if( isInArray ) {
        return;
      }
    }
    room.messages.push(msg);

    if( this.state.room._id == roomId ) {
      this.state.room = room; // Make sure this new room is displayed after the 1st message
    }
    this.needsScroll = true;
    this.setState( this.state );
  }
  onUserListUpdate(users) {
    var self = this;
    users = users.filter(function( user ) {
      return user._id !== self.props.user._id;
    });
    this.setState( (state) => update(state, {users:{$set:users}}) );
  }
  onUserSelect(user) {
    console.log("Clicked:"+user._id+" - "+user.name);
    var room = this.state.rooms[user._id];
    // Select the room, or just use the user as a temp room
    this.setState( (state) => update(state, {room:{$set:room?room:user}}) );
  }
  onRoomSelect(room) {
    console.log("Clicked:"+room._id+" - "+room.name);
    this.setState( (state) => update(state, {room:{$set:room}}) );
  }
  onUploadClick(e){
    this.uploadInput.click();
  }
  handleFileUpload(e) {

    var self = this;

    var formData = new FormData();
    formData.append("file", e.target.files[0] );

    fetch("/upload/", {
      method: "POST",
      body: formData,
      credentials: 'same-origin',
    })
    .then(function(res){ return res.json(); })
    .then(function(data){ 
      self.sendMessage({
        value:data.originalname,
        filename:data.filename,
        mimetype:data.mimetype
      });
    });

  }


  //
  //  Methods
  //

  sendMessage(msg){
    var defaultMsg = {
      name:this.props.user.name || "Me",
      value:"[Missing Message]",
      roomId:this.state.room._id,
      roomName:this.state.room.name
    };
    msg = Object.assign(defaultMsg, msg || {});
    console.log("onMessageSend:",msg);
    this.socket.emit('message', msg);
  }

  componentDidUpdate() {
    if(this.chatBody && this.needsScroll ) {
      this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }
    this.needsScroll = false;
  }

  render() {
    var chatHistory = (this.state.room.messages || []).map(function(msg,i) {
        return ( 
          <message key={i} className={msg.isSender?"self":""}>
            <label>{msg.name}</label>
            <div>
              <span>
                {
                  msg.filename ? (
                    <strong><a href={'/upload/'+msg.filename} target="blank" >{msg.value}</a></strong>
                  ) : 
                    msg.value
                }
              </span>
            </div>
          </message> );
    });
    var user = this.props.user;

    return (
      <div className="row">
        <div className="col-sm-4">
          <div className={this.props.subview=='users'?'':'hidden-xs'} >
            <UserList 
              title="Online Users" 
              users={this.state.users}
              onClick={this.onUserSelect.bind(this)}
              />
          </div>

          <div className={this.props.subview=='users'?'':'hidden-xs'} >
            <RoomList 
              title="Messages" 
              rooms={this.state.rooms}
              onClick={this.onRoomSelect.bind(this)}
              />
          </div>

          <div className={"panel panel-default " +(this.props.subview=='account'?'':'hidden-xs')} >
            <div className="panel-heading">Account Info</div>
            <div className="panel-body">

              <div className="row">
                <div className="col-md-12">
                  Name: {user.name} <br/>
                  Email: {user.email} <br/>
                  Location: {user.location} <br/>
                  Promotion: {user.promotion} <br/>
                  Role: {user.role} <br/>
                  Phone: {user.phone} 
                </div>
              </div>
            </div>
            <div className="panel-footer">
              <button onClick={this.onLogout.bind(this)} >Logout</button>
            </div>
          </div>




        </div>
        <div className={"col-sm-8 "+(this.props.subview=='chat'?'':'hidden-xs')} >
          <div className="panel panel-default chat">
            <div className="panel-heading">{this.state.room.name}</div>
            <div className="panel-body" style={{maxHeight:'63vh',overflow:'scroll'}} ref={(input) => { this.chatBody = input; }} >

              <div className="row">
                <div className="col-md-12">
                  {chatHistory}
                </div>
              </div>

            </div>
            <div className="panel-footer">

              My Message:
              <br/><textarea onChange={this.onMessageChange.bind(this)} value={this.state.msg} />
              <div className="pull-right">
                <form style={{visibility:'hidden', width:0, height:0}}>
                  <input type="file" onChange={this.handleFileUpload.bind(this)}  ref={(input) => { this.uploadInput = input; }} />
                </form>
                <button onClick={this.onUploadClick.bind(this)} >Upload...</button> 
                <button onClick={this.onMessageSend.bind(this)}  >Send</button>
              </div><br/>&nbsp;

            </div>
          </div>

        </div>
      </div>
    );
  }
}