import React from 'react'
import io from "socket.io-client"
import update from 'immutability-helper'
import UserList from './UserList'
import RoomList from './RoomList'

export default class Register extends React.Component {
  propTypes: {
    onSuccess: React.PropTypes.func,
    onShowLogin: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      name:"",
      email:"",
      location:"",
      promotion:"",
      role:"",
      phone:"",
      password:""
    };
    this.options = {
      submitButton: {
        text: "Register"
      },
      loginButton: {
        text: "I have an account"
      },
      inputs: [
        {
          name:"name",
          type:"text",
          placeholder: "Name"
        },
        {
          name:"email",
          type:"email",
          placeholder: "Email"
        },
        {
          name:"location",
          type:"text",
          placeholder: "Location"
        },
        {
          name:"promotion",
          type:"text",
          placeholder: "Promotion"
        },
        {
          name:"role",
          type:"text",
          placeholder: "Role"
        },
        {
          name:"phone",
          type:"Phone",
          placeholder: "Phone Number"
        },
        {
          name:"password",
          type:"password",
          placeholder: "Password"
        }
      ]
    };
  }

  onSubmit(e){
    e.preventDefault();
    
    var self = this;
    fetch("/user/", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( {
        name:this.state.name,
        email:this.state.email,
        location:this.state.location,
        promotion:this.state.promotion,
        role:this.state.role,
        phone:this.state.phone,
        password:this.state.password
      })
    })
    .then(function(res){ return res.json(); })
    .then(function(data){ 
      if( data.status=="success" ) {
        self.props.onSuccess && self.props.onSuccess(data.user);
      } else {
        self.setState({"error":data.msg});
      }
    });
    return false;
  }

  onShowLogin(e){
    e.preventDefault();
    this.props.onShowLogin && this.props.onShowLogin(e);
  }


  handleInputChange(e) {
    var value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  render() {
    var self = this;
    return (
      <div>
        <form onSubmit={this.onSubmit.bind(this)}  >
          {this.options.inputs.map((input, i) => {
            return (
              <div key={input.name} className="form-group">
                <input id={input.name} type={input.type} className="form-control" placeholder={input.placeholder}  
                  name={input.name} 
                  onChange={self.handleInputChange.bind(this)} 
                  value={self.state[input.name]} 
                  required
                  />
              </div>
            );
          })}
          {
            this.state.error && (<p className="alert alert-danger">{this.state.error}</p>)
          }
          <button type="submit" className="btn btn-default">{this.options.submitButton.text}</button>
          <br/><a href="#login" onClick={this.onShowLogin.bind(this)}  >{this.options.loginButton.text}</a>
        </form>
      </div>);
  }
}