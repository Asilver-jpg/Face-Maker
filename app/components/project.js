import React from 'react';
import "./components.css"
import Canvas from "./canvas"
const URL = "http://localhost:3001"

export default class Project extends React.Component {
    state = {
        id: "",
        mainCanvas: "",
        mainContext: "",
        canvasWidth: 0,
        canvasHeight: 0,
        color: "#0000FF",
        shapes: [],
        fill: "",
        stroke: "",
        project:"",
        loop:""
    }

    componentDidMount() {
        let id= window.location.href[window.location.href.length-1]
        let mainCanvas = document.querySelector("#canvas")
        let mainContext = mainCanvas.getContext("2d")
        let canvasWidth = mainCanvas.width
        let canvasHeight = mainCanvas.height
        fetch(`${URL}/projects/${id}`)
            .then(response => response.json())
            .then(data => this.setState({ mainCanvas: mainCanvas, mainContext: mainContext, project: data, id: window.location.href[window.location.href.length-1], canvasWidth: canvasWidth, canvasHeight: canvasHeight,
                 }))

    }
    render(){
        return(
        <div id="canvasDiv">
                <canvas id="canvas" height="600" width="450"></canvas>
                <p>{this.state.project.name}</p>
            </div>
        )
    }
    
}
