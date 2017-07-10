import React from 'react'
import Login from './Login'
import Chat from './Chat'
import Register from './Register'

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      view:'login',
      subview:'chat',
      user: null
    };
  }

  loginSuccess(user) {
    this.setState({user:user});
    this.showChat();
  }
  logout() {
    this.setState({view:'login'});
  }
  showChat() {
    this.setState({view:'chat'});
  }
  showRegister() {
    this.setState({view:'register'});
  }
  showLogin(){
    this.setState({view:'login'});
  }

  onUserClick(){
    this.setState({subview:'users'});
  }
  onAccountClick(){
    this.setState({subview:'account'});
  }
  onChatClick(){
    this.setState({subview:'chat'});
  }

  render() {

    if( this.state.view=="chat" ) {
      return (
        <div className={'container-fluid show-'+this.state.subview}>

          <div className="row">
            <div className="col-sm-4 hidden-xs">
              <h3>Promotion</h3>
            </div>
            <div className="col-sm-8">
              <h3>Brand X 2017 Promotion</h3>
              <ul className="nav navbar-nav navbar-right hidden-sm hidden-md hidden-lg hidden-xl">
                <li className={this.state.subview=='users'?'active':''}><a href="#" onClick={this.onUserClick.bind(this)}><span className="glyphicon glyphicon-info-sign"></span> Users</a></li>
                <li className={this.state.subview=='account'?'active':''}><a href="#" onClick={this.onAccountClick.bind(this)}><span className="glyphicon glyphicon-user"></span> Account</a></li>
                <li className={this.state.subview=='chat'?'active':''} ><a href="#" onClick={this.onChatClick.bind(this)}><span className="glyphicon glyphicon-edit"></span> Chat</a></li>
              </ul>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <Chat onLogout={this.logout.bind(this)} user={this.state.user}  subview={this.state.subview}  />
            </div>
          </div>
        </div>
      );
    } else if( this.state.view=="register" ) {
      return (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4 col-md-offset-4">

              <h1>Promotion Chat System</h1>
              <h3>Register</h3>
              <Register  
                onSuccess={this.loginSuccess.bind(this)} 
                onShowLogin={this.showLogin.bind(this)} />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4 col-md-offset-4">

              <h1>Promotion Chat System</h1>
              <h3>Login</h3>
              <Login 
                onSuccess={this.loginSuccess.bind(this)}
                onShowRegister={this.showRegister.bind(this)}
                />
            </div>
          </div>
        </div>
      );
    }
  }
}
