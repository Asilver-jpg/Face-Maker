import React from 'react';
import "./components.css"
export default class Controls extends React.Component{

render(){
  if(this.props.mode==="Edit"){
      return(
        <div id="controls">
        <p>Nose Point: Move Shape</p>
        <p>Head Rotation: Rotate Shape</p>
        <p>Open Mouth: Scale Shape</p>
        <p>Scrunch Nose: Cycle through Colors</p>
        <p>Hold Nose Scrunched: Switch to Select Mode</p>
    </div>
      )
  }else{
      return(
        <div id="controls">
        <p>Nose Point: Move Cursor</p>
        <p>Raise Eyebrows: Select/Deselect Shape</p>
        <p>Eyebrows Held: Delete Shape</p>
        <p>Scrunch nose: Switch to Edit Mode</p>
    </div>

      )
  }
    
    
}

generateControls=()=>{
    if(this.props.mode==="Edit"){
        return(
            <div id="controls">
                <p>Nose Point: Move Shape</p>
                <p>Head Rotation: Rotate Shape</p>
                <p>Open Mouth: Scale Shape</p>
                <p>Scrunch Nose: Cycle through Colors</p>
                <p>Hold Nose Scrunched: Switch to Select Mode</p>
            </div>
        )
    }else{
        <div id="controls">
                <p>Nose Point: Move Cursor</p>
                <p>Raise Eyebrows: Select/Deselect Shape</p>
                <p>Eyebrows Held: Delete Shape</p>
                <p>Scrunch nose: Switch to Edit Mode</p>
            </div>

    }
}

}
