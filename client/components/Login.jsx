import React from 'react'

export default class Login extends React.Component {
  propTypes: {
    options: React.PropTypes.object,
    onSuccess: React.PropTypes.func,
    onShowRegister: React.PropTypes.func
  }
  constructor(props) {
    super(props);
    this.state = {};
  }

  onSubmit(e){
    e.preventDefault();
    
    var self = this;

    fetch("/auth/", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          email:this.state.email,
          password:this.state.password
        }),
        credentials: 'same-origin',
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

  onShowRegister(e){
    e.preventDefault();
    this.props.onShowRegister && this.props.onShowRegister(e);
  }
  handleInputChange(e) {
    var value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  render() {
    let options = {
      email: {
        placeholder: "Email"
      },
      password: {
        placeholder: "Password"
      },
      submitButton: {
        text: "Login"
      },
      recoverButton: {
        text: "Did you forget your email or password?",
        link: "mailto:promotions@companyx.com"
      },
      registerButton: {
        text: "No Account? Register.",
      }
    };
    options = Object.assign(options, this.props.options || {});
    return <div>
      <form onSubmit={this.onSubmit.bind(this)} >
        <div className="form-group">
          <input type="email" className="form-control" placeholder={options.email.placeholder} 
            name="email"
            onChange={this.handleInputChange.bind(this)} />
        </div>
        <div className="form-group">
          <input type="password" className="form-control" placeholder={options.password.placeholder} 
            name="password"
            onChange={this.handleInputChange.bind(this)} />
        </div>
        {
          this.state.error && (<p className="alert alert-danger">{this.state.error}</p>)
        }
        <button type="submit" className="btn btn-default">{options.submitButton.text}</button>
        <br/><a href={options.recoverButton.link} >{options.recoverButton.text}</a>
        <br/><a href="#register" onClick={this.onShowRegister.bind(this)}  >{options.registerButton.text}</a>
      </form>
    </div>
  }
}