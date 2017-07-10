import React from 'react'

export default class UserList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var self = this;
    var title = this.props.title || "Users";
    var userEl = function(user) {
      var click = function(){
        self.props.onClick && self.props.onClick(user);
      }
      return (
        <div key={user._id}>
          <button onClick={click}>{user.name}</button>
        </div>
      );
    }
    return (
      <div className="panel panel-default">
        <div className="panel-heading">{title}</div>
        <div className="panel-body">
          {this.props.users.map((user, i) => {
            return userEl(user);
          })}
        </div>
      </div>
    );
  }
}