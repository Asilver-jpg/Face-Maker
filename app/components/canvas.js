import React from 'react';
import "./components.css"
import CanvasDetails from "./canvasDetails.js"
import ColorPicker from "./colorPicker.js"
import Controls from "./controls"
import LoadingScreen from "./loadingScreen"
const URL = "http://localhost:3001"
const colorRegex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
//has props of faceToMove, eyebrows, eyebrowsHeld, noseScrunch, noseScrunchHeld and noseAngle
export default class Canvas extends React.Component {
    state = {
        mainCanvas: "",
        mainContext: "",
        hitCtx: "",
        canvasWidth: 0,
        canvasHeight: 0,
        color: "#0000FF",
        mode: "d",
        noseIsScrunched: 0,
        loop: "",
        activeShape: "",
        mappedNosePosition: {
            x: 0,
            y: 0
        },
        shapes: [],
        fill: "",
        stroke: "",
        colorsHash: {},
        isPlaced: false,
        startWidth: 0,
        startHeight: 0,
        eyebrowsUp: false,
        fromSelect: false,
        isDelete: false,
        project: "",
        isMine: false,
        addList:[],
        toRemove: [],
        activeShapePreviousColor: ""

    }

    componentDidMount() {
        //rect posX, posY, width, height, fill, stroke, strokeWeight
        let id = this.getId()

        let mainCanvas = document.querySelector("#canvas")
        let mainContext = mainCanvas.getContext("2d")
        let hitCanvas = document.createElement('canvas')
        hitCanvas.width = 450
        hitCanvas.height = 600
        let hitCtx = hitCanvas.getContext('2d')

        let canvasWidth = mainCanvas.width
        let canvasHeight = mainCanvas.height


        let isNum = /^\d+$/
        if (isNum.test(id)) {
            fetch(`${URL}/projects/${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.user_id.toString() === sessionStorage.getItem("user_id")) {
                        this.setState({
                            mainCanvas: mainCanvas, mainContext: mainContext, hitCtx: hitCtx, canvasWidth: canvasWidth, canvasHeight: canvasHeight,
                            stroke: this.hexToRgb("#003300"), fill: this.hexToRgb("#00FF00"), project: data, loop: setInterval(this.draw, 3), mode: "Edit", isMine: true
                        })
                    } else {
                        this.setState({ mainCanvas: mainCanvas, mainContext: mainContext, project: data, id: window.location.href[window.location.href.length - 1], canvasWidth: canvasWidth, canvasHeight: canvasHeight })
                    }
                })
                .then(data => {
                    if (this.state.isMine === false) {
                        console.log("setting false canvas")
                        this.props.setShouldRender(false)
                        this.addAllShapesFromProject()
                        this.drawAllShapes()
                    } else {
                        console.log("setting true canvas")
                        this.props.setShouldRender(true)
                        this.addAllShapesFromProject()
                        this.addHitGraph();
                        this.drawAllShapes()
                    }
                })
        }
        this.state.loop
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.mainContext !== this.state.mainContext) {
            setInterval(() => { this.drawAllShapes() }, 1000)
        }
    }
    componentWillUnmount() {
        clearInterval(this.state.loop)
    }

    //canvas functions

    //called every 3 milliseconds
    draw = () => {
        //console.log(this.props.nosePosition[0])
        this.clearCanvas(this.state.mainContext)

        //if face is in the right place and exists
        if (this.props.faceToMove === 0) {
            this.setState({
                mappedNosePosition: {
                    x: this.getCanvasPointX(Math.floor(this.props.nosePosition[0])),
                    y: this.getCanvasPointY(Math.floor(this.props.nosePosition[1]))
                }
            }, () => {
                this.manageMode()
                if (this.state.mode === "Edit") {
                    this.manageTransform()
                } else if (this.state.mode === "Select") {
                    this.manageSelect()
                }else if(this.state.mode=== "Shape Settings"){
                    this.manageShapeSettings()
                }
                this.managePlacement()
            })
        }
        if (this.props.eyebrows === false) {
            this.setState({ toDelete: false })
        }
        this.drawAllShapes()
        if (this.state.mode === "Select") {
            this.drawCursor(this.state.mainContext)
        }
    }

    clearCanvas = (context) => {
        context.clearRect(0, 0, 450, 600)
    }
    //shape management functions
    manageMode = () => {
        if (this.state.noseIsScrunched === 0 && this.props.noseScrunch) {
            this.setState({ noseIsScrunched: 1 })
        } else if (this.props.noseScrunchHeld) {
            this.setState({ noseIsScrunched: 2 })
        } else if (this.state.noseIsScrunched === 1 && this.props.noseScrunch === false) {

            // switch (this.state.mode) {
            //     case "Edit":
            //         this.setState({ mode: "Direct Edit", noseIsScrunched: 0 })
            //         break;
            //     case "Direct Edit":
            //         this.setState({ mode: "Edit", noseIsScrunched: 0 })
            //         break;
            //     case "Select":
            //         this.setState({ mode: "Edit", noseIsScrunched: 0, activeShape: "" })
            //         break;
            //}
        } else if (this.state.noseIsScrunched === 2 && this.props.noseScrunch === false) {
            switch (this.state.mode) {
                case "Edit":
                    this.setState({ mode: "Select", noseIsScrunched: 0 })
                    break;
                case "Select":
                    let shapesArr= this.state.shapes
                    shapesArr.pop()
                    this.setState({ mode: "Edit",activeShape:"", noseIsScrunched: 0, shapes: shapesArr })
                    break;
            }
        }
    }
    //posX, posY, width, height, fill, stroke, strokeWeight
    manageTransform = () => {
        let color = `(${this.state.fill.r},${this.state.fill.g},${this.state.fill.b})`
        if (this.state.activeShape === "") {
            let newShape = new Rectangle(this.state.mappedNosePosition.x, this.state.mappedNosePosition.y, 60, 60, color, this.state.stroke, this.state.strokeWeight, 0, this.getId())
            this.addToShapes(newShape)
            this.setState({ activeShape: newShape, startHeight: newShape.height, startWidth: newShape.width })
        } else {
            this.setActiveShapeFill(this.state.activeShapePreviousColor)
            let editedNewShape = new Rectangle(this.state.mappedNosePosition.x, this.state.mappedNosePosition.y, this.state.startWidth + this.getRectDimensions(this.props.mouthDist),
                this.state.startHeight + this.getRectDimensions(this.props.mouthDist), color, this.state.stroke,
                this.state.strokeWeight, this.props.noseAngle * 2, this.getId())
              
            let shapesArr= [...this.state.shapes]
            shapesArr.pop()
            shapesArr.push(editedNewShape)
            this.setState({ activeShape: editedNewShape, shapes: shapesArr })

        }
    }


// set active shape to "" in edit mode since it's already in the shapes array
    managePlacement = () => {
        if (this.props.eyebrows && this.state.activeShape !== "") {
            if (this.state.mode === "Edit" && this.state.isPlaced === false) {
                let addList= [...this.state.addList]
                addList.push(this.state.activeShape)
                this.setState({ activeShape: "", addList: addList, isPlaced: true })
                this.addHitGraph()
            }
        } else if (this.props.eyebrows === false && this.state.isPlaced === true) {
            this.setState({ isPlaced: false })
        }
    }

    manageSelect = () => {
        const pixel = this.state.hitCtx.getImageData(this.state.mappedNosePosition.x, this.state.mappedNosePosition.y, 1, 1).data
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const shape = this.state.colorsHash[color];
        console.log(this.state.activeShape !== "")
        if (!this.props.eyebrows) {
            this.setState({ eyebrowsUp: false })
        }
        if (this.state.activeShape !== "" && this.props.eyebrowsHeld) {
            console.log("Deleting")
            this.deleteShape(this.state.activeShape)
            this.setState({ fromSelect: false, eyebrowsUp: true, activeShape: "" })
        } else
            if (shape !== undefined && this.props.eyebrows && this.state.eyebrowsUp === false) {
                console.log("Select")
                this.setState({ activeShape: shape, eyebrowsUp: true, fromSelect: true }, ()=>{ this.setActiveShapeFill("(0,0,0)")})

            } else if (shape === undefined && this.props.eyebrows && this.state.activeShape !== "" && this.state.eyebrowsUp === false) {
                console.log("Deselect")
                this.setActiveShapeFill(this.state.activeShapePreviousColor)
                this.setState({ activeShape: "", eyebrowsUp: true, fromSelect: false })
            }
    }



    deleteShape = (shape) => {
        if (this.state.isDelete === false) {
            let toDeleteArr = []
            if (shape.id) {
                toDeleteArr = [...this.state.toDelete, shape]
            } else {
                toDeleteArr = [...this.state.toDelete]
            }
            //this.removeFromAddList(shape)
            let color = shape.colorKey
            let colorCopy = { ...this.state.colorsHash }
            delete colorCopy[color]
            this.setState({ toRemove: toDeleteArr, colorsHash: colorCopy, isDelete: false, shapes: [...this.state.shapes.filter(s => s !== shape)] })
        }
    }

    manageShapeSettings=()=>{
        let activeShape= this.state.activeShape
        let shapesArr = [...this.state.shapes]
        if (!this.props.eyebrows) {
            this.setState({ eyebrowsUp: false })
        }
        if(this.props.eyebrows && this.state.eyebrowsUp===false){
            this.setState({shapeToUse: !(this.state.shapeToUse)}, () => {
                if(this.state.shapeToUse===true){
                    //make circle
                    let circle= new Circle(activeShape.posX, activeShape.posY, activeShape.width/2,this.state.fill, this.state.stroke ,0)
                    shapesArr[shapesArr.length-1] =circle
                    this.setState({shapes:shapesArr, eyebrowsUp:true})
                }else{
                    //make rectangle
                    let rectangle= new Rectangle(activeShape.posX, activeShape.posY, activeShape.radius*2, activeShape.radius*2,this.state.fill, this.state.stroke ,0, this.getId() )
                    shapesArr[shapesArr.length-1] =rectangle
                    this.setState({shapes:shapesArr}, eyebrowsUp:true)

                }
            })
        }
    }

    //mapping functions
    getCanvasPointX = (value) => {

        if (value > 240) {
            value = 240
        } else if (value < 150) {
            value = 150
        }
        return this.mapRange(value, 150, 240, 450, 0)
    }
    getCanvasPointY = (value) => {
        if (value > 200) {
            value = 200
        } else if (value < 100) {
            value = 100
        }
        return this.mapRange(value, 100, 200, 0, 600)
    }
    getRectDimensions = (value) => {
        return this.mapRange(value, 0, 24, 0, 100)
    }
    //map range 1 to range 2
    mapRange = (value, low1, high1, low2, high2) => {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
    }

    mapNose = (value, scaleFactor) => {
        if (value >= 0) {
            return scaleFactor * (90 - value)
        } else {
            return -1 * scaleFactor * (90 + value)
        }
    }


    //drawing functions
    drawCircle = (posx, posy, radius, context) => {

        let r = 40;
        context.beginPath();
        context.arc(posx, posy, radius, 0, 2 * Math.PI, false);
        if (context.canvas.id) {
            context.lineWidth = shape.lineWidth
            context.strokeStyle = shape.strokeStyle
            context.stroke()
            context.fillStyle = `rgb(${shape.color.r}, ${shape.color.g}, ${shape.color.b})`;
            context.fill()
        } else {
            context.fillStyle = shape.colorKey
            context.hitCtx.fill()
        }
    }

    drawRectangle = (shape, context, color) => {
        if (context.canvas.id) {
            context.lineWidth = shape.lineWidth
            context.strokeStyle = shape.strokeStyle
            context.stroke()
            
            let colors = `rgb${shape.color}`
            context.fillStyle = colors
            context.fill()
        } else {
            context.fillStyle = shape.colorKey
        }
        context.beginPath()
        context.translate(shape.posX + (shape.width / 2), shape.posY + (shape.height / 2))
        context.rotate((-1 * shape.rotation * Math.PI / 180))
        context.fillRect(0, 0, shape.width, shape.height)

        context.resetTransform()
    }
    drawCursor = (context) => {
        let radius = 5;
        context.beginPath();
        context.arc(this.state.mappedNosePosition.x, this.state.mappedNosePosition.y, radius, 0, 2 * Math.PI, false);
        context.lineWidth = 3;
        context.strokeStyle = "#000000"
        context.fillStyle = null
        context.fill()
        context.stroke()




    }
    addHitGraph = () => {
        this.state.shapes.forEach(shape => {
            while (true) {
                const colorKey = this.getRandomColor()

                if (!this.state.colorsHash[colorKey]) {
                    shape.colorKey = colorKey
                    this.state.colorsHash[colorKey] = shape

                    return;
                }
            }
        })
    }
    //  constructor(posX, posY, width, height, fill, stroke, strokeWeight, rotation = 0) {
    addAllShapesFromProject = () => {

        this.state.project.shapes.forEach(shape => {
            if (shape.value4 !== null) {
                let rect = new Rectangle(shape.value1, shape.value2, shape.value3, shape.value4, shape.fill, shape.stroke, shape.stroke_weight, shape.rotation, this.getId())
                rect.setId(shape.id)
                
                this.addToShapes(rect)
            }

        })

    }

    drawAllShapes = () => {

        if (this.state.mode === "Edit") {
            const filter= this.state.shapes.filter((shape)=>shape.color===this.state.fill)
            this.state.shapes.forEach(shape => {
                this.drawTheShapes(shape, this.state.mainContext, shape.color)
            })
            for (let i = 0; i < this.state.shapes.length - 1; i++) {
                this.drawTheShapes(this.state.shapes[i], this.state.hitCtx, this.state.shapes[i].colorKey)
            }
        } else if (this.state.mode === undefined) {
            this.drawTheShapes(shape, this.state.mainContext, shape.color)

        } else if (this.state.mode === "d") {
            this.state.shapes.forEach(shape => {
                this.drawTheShapes(shape, this.state.mainContext, shape.color)
            })
        } else {
            this.state.shapes.forEach(shape => {
                this.drawTheShapes(shape, this.state.mainContext, shape.color)
                this.drawTheShapes(shape, this.state.hitCtx, shape.colorKey)
            })
        }
    }

    setActiveShapeFill = (color) => {
        let shape = this.state.activeShape
        let shapeArr = [...this.state.shapes]
        this.setState({ activeShapePreviousColor: shape.getColor() })
        shapeArr.forEach(s => {
            if (s === shape) {
                s.setColor(color)
            }
        })
    }
    drawTheShapes = (shape, context, color) => {
        if (shape.radius) {

            this.drawCircle(shape, context)

        } else if (shape.width) {

            this.drawRectangle(shape, context, color)
        }
    }
    addToShapes = (shape) => {
        let shapesAdd = [...this.state.shapes, shape]
        this.setState({ shapes: shapesAdd })
    }
    getRandomColor = () => {
        const r = Math.round(Math.random() * 255);
        const g = Math.round(Math.random() * 255);
        const b = Math.round(Math.random() * 255);
        return `rgb(${r},${g},${b})`;
    }
    hexToRgb = (hex) => {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    save = () => {

        // constructor(posX, posY, width, height, fill, stroke, strokeWeight, rotation = 0) {
        console.log(this.state.shapes)
        // this.state.shapes.forEach(shape => {
        //     let updatedShape = {
        //         value1: shape.posX,
        //         value2: shape.posY,
        //         value3: shape.width,
        //         value4: shape.height,
        //         fill: `(${this.state.fill.r},${this.state.fill.g},${this.state.fill.b} )`,
        //         stroke: "no",
        //         stroke_weight: 0,
        //         render_number: 0,
        //         rotation: shape.rotation,
        //         project_id: this.getId()
        //     }
            //for patching, no reason to use yet. Will have to make a different object than above
            // if (shape.id) {
                //   fetch(`${URL}/shapes/${shape.id}`,{
                //            method: 'PATCH',
                //            headers: {
                //             'Content-Type': 'application/json',
                //           },
                //            body: JSON.stringify(updatedShape),    
                //        }).then(resp=>resp.json())
                //        .then(json=> console.log(json)) 
            // } else {
                fetch(`${URL}/shapes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.state.addList),
                }).then(resp => resp.json())
                    .then(json => console.log(json))
            
        // })
        this.state.toRemove.forEach(shape => {
            this.removeShapeFromBackend(shape)
        })

    }
    removeFromAddList= (shape)=>{
        this.setState({ addList: [...this.state.addList.filter(s => s !== shape)] })

    }
    removeShapeFromBackend = (shape) => {
        fetch(`${URL}/shapes/${shape.id}`, {
            method: 'DELETE'
        })
    }
    getId = () => {
        let lastSection = /\/([0-9_-]*[\/]?)$/g
        let id = window.location.href.match(lastSection)
        id = id[0].slice(1)
        return id
    }

    changeFillColor=(color)=>{
        let colorRGB=this.hexToRgb(color.hex)
        
            this.setState({fill: colorRGB})
          
    }

    render() {
      
    if(this.props.shouldRender){
        return (
            <div id="canvasDiv"  >
                <canvas id="canvas" height="600" width="450"></canvas>

                <CanvasDetails mode= {this.state.mode}save={this.save} project={this.state.project} isMine={this.state.isMine}/>
                <ColorPicker changeFillColor= {this.changeFillColor}/>

                <Controls mode={this.state.mode} />

            </div>

        )
        }else{
            return(
                <div id="canvasDivNoUser"  >
                <canvas id="canvas" height="600" width="450"></canvas>

                <CanvasDetails mode= {this.state.mode}save={this.save} project={this.state.project} isMine={this.state.isMine}/>
        

            </div>

            )
        }
    }
}

class Rectangle {
    constructor(posX, posY, width, height, fill, stroke, strokeWeight, rotation = 0, projectId=null) {
        this.posX = posX
        this.posY = posY
        this.width = width
        this.height = height
        this.color = fill
        this.stroke = stroke
        this.strokeWeight = strokeWeight
        this.colorKey = new Color(0, 0, 0)
        this.rotation = rotation
        this.id = null
        this.projectId=projectId
    }
    setColorKey(value) {
        this.colorKey = value
    }
    getColorKey() {
        return this.colorKey
    }
    setId(value) {
        this.id = value
    }
    getId() {
        return this.id
    }
    getColor() {
        return this.color
    }
    setColor(value) {
        this.color = value
    }
}


class Circle {
    constructor(posX, posY, radius, fill, stroke, strokeWeight) {
        this.posX = posX
        this.posY = posY
        this.radius = radius
        this.color = fill
        this.stroke = stroke
        this.strokeWeight = strokeWeight
        this.colorKey = ""
        this.id = null
    }
    setColorKey(value) {
        this.colorKey = value
    }
    getColorKey() {
        return this.colorKey
    }
    setId(value) {
        this.id = value
    }
    getId() {
        return this.id
    }
    getColor() {
        return this.color
    }
    setColor(value) {
        this.color = value
    }
}
class Color {
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }
}
