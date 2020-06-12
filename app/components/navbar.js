import React from 'react';
import "./components.css"
import {NavLink} from 'react-router-dom'
export default class Navbar extends React.Component{
resetLogin=()=>{
    console.log(sessionStorage)
    delete sessionStorage["username"]
    delete sessionStorage["pwd"]
}
render(){
    return(
        <div>
        <ul id= "navbar">
            <li>
                <NavLink to={{pathname:"/"}} class="link">Home</NavLink>
            </li>
            <li>
            <NavLink to={{pathname:"/new"}} class="link">New Project</NavLink>
            </li>
            <li>
            <NavLink to={{pathname:"/portfolio"}} class="link">Portfolio</NavLink>
            <NavLink to={{pathname:"/"}} onClick={this.resetLogin}>Sign Out</NavLink>
            </li>

        </ul>
        </div>
    )
}

}
