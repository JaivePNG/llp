import React from 'react'

export default class RoomList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var self = this;
    var title = this.props.title || "Rooms";
    var roomEl = function(room) {
      var click = function(){
        self.props.onClick && self.props.onClick(room);
      }
      return (
        <div key={room._id}>
          <button onClick={click}>{room.name}</button>
        </div>
      );
    }

    var rooms = [];
    Object.keys(this.props.rooms).forEach(function(key) {
      rooms.push(self.props.rooms[key]);
    });
    return (
      <div className="panel panel-default">
        <div className="panel-heading">{title}</div>
        <div className="panel-body">
          {rooms.map((room, i) => {
            return roomEl(room);
          })}
        </div>
      </div>
    );
  }
}