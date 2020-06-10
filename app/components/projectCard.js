import React from 'react';
import "./components.css"
import {Link} from 'react-router-dom'
export default class ProjectCard extends React.Component{

render(){
    return(
        <div>
            <p>this.props.project.name</p>
            {
            /* <Link to={{
                pathname: '/project',
                state: {
                    project: this.props.project.id
                }
                }}>{this.props.project.name}</Link> */}
        </div>
    )
}

}
