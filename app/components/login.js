import React from 'react';
import history from './history'
import "./components.css"
const URL = "http://localhost:3001"

export default class Login extends React.Component {
    state={
        username:"",
        password:""
    }

    handleUserNameChange=event=>{
        this.setState({username: event.target.value})
    }
    handlePasswordChange=event=>{
        this.setState({password: event.target.value})
    }
    handleSubmit=event=>{
        
        event.preventDefault()
     
        sessionStorage.setItem("username", this.state.username)
        sessionStorage.setItem("pwd", this.state.password) 
            fetch(`${URL}/users`)
            .then(resp => resp.json())
            .then(data => {
                console.log(data)
                for (const user of data) {
                  
                    if (user.user_name === sessionStorage["username"]) {
                        sessionStorage.setItem("user_id", user.id)  
                        history.push('/')
                    }
                }
            })
      

    }
    componentDidMount(){
        console.log(sessionStorage)
    }
    render(){
    return (
        <div id="login">
            <h1 id="loginTitle">FaceMaker</h1>
            <form onSubmit={event=> this.handleSubmit(event)}>
                <label>
                    User Name:
                 <input type="text" name="username" onChange={event=>this.handleUserNameChange(event)} value={this.state.username}/>
                </label>
                <br></br>
                <label>
                    Password:
                 <input type="text" name="password" onChange={event=>this.handlePasswordChange(event)} value={this.state.password}/>
                </label>
                <input type="submit" value="Login" />
                <input type="submit" value="Sign Up" />
            </form>

        </div>
    )
    }
}
