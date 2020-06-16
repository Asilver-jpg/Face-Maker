import React from 'react';
import "./components.css"
import {Link} from 'react-router-dom'

export default class CanvasDetails extends React.Component{

render(){
    if(this.props.isMine===true){
        return(<div id= "canvasDetails">

<button  id= "saveButton"onClick={this.props.save}>Save</button>

    <p>{this.props.project.name}</p>

    <p> Made By:&nbsp;{this.props.project.user.user_name}</p>
        </div>)
    }else{
return(<div id= "canvasDetails">

<p>{this.props.project.name}</p>
<p> Made By:{this.props.project.user.user_name}</p>
</div>)
    }
    
}

}
