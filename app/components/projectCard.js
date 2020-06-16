import React from 'react';
import "./components.css"
import {Link} from 'react-router-dom'
import Image from "../public/images/default.png"
export default class ProjectCard extends React.Component{

render(){
    console.log(this.props.project)
    return(
        <div class="projectCard">        
             <Link to={{
                pathname: `/project/${this.props.project.id}`,
                
                }}><img className= "projectImg"src= {Image} height="150"/><br/>
                {this.props.project.name}</Link> 
                <br/>

            {this.props.name ? <p>By: {this.props.name}</p> : <p>By: {this.props.project.user.user_name}</p> }
        </div>
    )
}

}
