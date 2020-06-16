import React from 'react';
import "./components.css"
import {Link} from 'react-router-dom'
import Image from "../public/images/default.png"
export default class ProjectCard extends React.Component{

render(){
    return(
        <div class="projectCard">        
             <Link to={{
                pathname: `/project/${this.props.project.id}`,
                
                }}><img className= "projectImg"src= {Image} height="150"/><br/>
                {this.props.project.name}</Link> 
        </div>
    )
}

}
