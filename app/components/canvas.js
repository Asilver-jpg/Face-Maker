import React from 'react';
import "./components.css"
//has props of faceToMove, eyebrows, eyebrowsHeld, noseScrunch, noseScrunchHeld and noseAngle
export default class Canvas extends React.Component {
    state = {
        mainCanvas: "",
        mainContext: "",
        hitCtx: "",
        canvasWidth: 0,
        canvasHeight: 0,
        color: "#0000FF",
        mode: "Select",
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
        fromSelect: false
    }

    componentDidMount() {
        //rect posX, posY, width, height, fill, stroke, strokeWeight
        let mainCanvas = document.querySelector("#canvas")
        let mainContext = mainCanvas.getContext("2d")
        let hitCanvas = document.createElement('canvas')
        hitCanvas.width = 450
        hitCanvas.height = 600
        let hitCtx = hitCanvas.getContext('2d')
        let canvasDiv = document.getElementById("canvasDiv")
        canvasDiv.appendChild(hitCanvas)
        let canvasWidth = mainCanvas.width
        let canvasHeight = mainCanvas.height

        let color = new Color(255, 0, 0)
        let rect = new Rectangle(200, 200, 80, 80, color, 2)
        this.addToShapes(rect)

        this.setState({
            mainCanvas: mainCanvas, mainContext: mainContext, hitCtx: hitCtx, canvasWidth: canvasWidth, canvasHeight: canvasHeight,
            stroke: this.hexToRgb("#003300"), fill: this.hexToRgb("#00FF00"), loop: setInterval(this.draw, 3)
        },
            () => {
                this.addHitGraph();
                this.drawAllShapes()
            }
        )
        console.dir(hitCanvas)

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
        this.clearCanvas()
        //if face is in the right place and exists
        if (this.props.faceToMove === 0) {
            this.setState({
                mappedNosePosition: {
                    x: this.getCanvasPointX(Math.floor(this.props.nosePosition[0])),
                    y: this.getCanvasPointY(Math.floor(this.props.nosePosition[1]))
                }
            }, () => {
                //this.manageMode()
                if (this.state.mode === "Edit") {
                    this.manageTransform()
                } else if (this.state.mode === "Select") {
                    this.manageSelect()
                }
                this.managePlacement()
            })
        }

        this.drawAllShapes()
        if (this.state.mode === "Select") {
            this.drawCursor(this.state.mainContext)
        }
    }

    clearCanvas = () => {
        let mainCanvas = document.querySelector("#canvas")
        let context = mainCanvas.getContext("2d")
        context.clearRect(0, 0, 450, 600)
    }
    //shape management functions
    manageMode = () => {
        if (this.state.noseIsScrunched === 0 && this.props.noseScrunch) {
            this.setState({ noseIsScrunched: 1 })
        } else if (this.props.noseScrunchHeld) {
            this.setState({ noseIsScrunched: 2 })
        } else if (this.state.noseIsScrunched === 1 && this.props.noseScrunch === false) {

            switch (this.state.mode) {
                case "Edit":
                    this.setState({ mode: "Direct Edit", noseIsScrunched: 0 })
                    break;
                case "Direct Edit":
                    this.setState({ mode: "Edit", noseIsScrunched: 0 })
                    break;
                case "Select":
                    this.setState({ mode: "Edit", noseIsScrunched: 0 })
                    break;
            }
        } else if (this.state.noseIsScrunched === 2 && this.props.noseScrunch === false) {
            this.setState({ mode: "Select", noseIsScrunched: 0 })
        }
    }
    //posX, posY, width, height, fill, stroke, strokeWeight
    manageTransform = () => {

        if (this.state.activeShape === "") {
            let newShape = new Rectangle(this.state.mappedNosePosition.x, this.state.mappedNosePosition.y, 20, 20, this.state.fill, this.state.stroke, this.state.strokeWeight, 0)
            this.addToShapes(newShape)
            this.setState({ activeShape: newShape, startHeight: newShape.height, startWidth: newShape.width })
        } else {
            let editedNewShape = new Rectangle(this.state.mappedNosePosition.x, this.state.mappedNosePosition.y, this.state.startWidth + this.getRectDimensions(this.props.mouthDist),
                this.state.startHeight + this.getRectDimensions(this.props.mouthDist), this.state.fill, this.state.stroke,
                this.state.strokeWeight, this.props.noseAngle * 2)
            this.state.shapes[this.state.shapes.length - 1] = editedNewShape
            this.setState({ activeShape: editedNewShape })
        }
    }



    managePlacement = () => {
        if (this.props.eyebrows && this.state.activeShape !== "") {
            if (this.state.mode === "Edit" && this.state.isPlaced === false) {
                this.setState({ activeShape: "", isPlaced: true })
            }
        } else if (this.props.eyebrows === false && this.state.isPlaced === true) {
            this.setState({ isPlaced: false })
        }
    }

    manageSelect = () => {
        const pixel = this.state.hitCtx.getImageData(this.state.mappedNosePosition.x, this.state.mappedNosePosition.y, 1, 1).data
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const shape = this.state.colorsHash[color];
        if (!this.props.eyebrows) {
            this.setState({ eyebrowsUp: false })
        }
        if(this.state.activeShape!== "" && this.props.eyebrowsHeld){
                console.log("delete")
                this.deleteShape(this.state.activeShape)
                this.setState({fromSelect:false, eyebrowsUp: false, activeShape:""})
        }else 
        if (shape !== undefined && this.props.eyebrows && this.state.eyebrowsUp === false) {
            console.log("Select")
            this.setState({ activeShape: shape, eyebrowsUp: true, fromSelect: true })

        } else if (shape === undefined && this.props.eyebrows && this.state.activeShape !== "" && this.state.eyebrowsUp === false) {
            console.log("Deselect")
            this.setState({ activeShape: "", eyebrowsUp: true, fromSelect: false })
        }
    }

    deleteShape = (shape) => {
        let index = this.state.shapes.indexOf(shape)
        if (index > -1) {
            let toDelete = this.state.shapes[index]
            this.state.shapes.splice(index, 1)
            let color = `rgb(${toDelete.color.r}, ${toDelete.color.g}, ${toDelete.color.b})`
            delete this.state.colorsHash[color]
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
        return this.mapRange(value, 0, 24, 0, 60)
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

    drawRectangle = (shape, context) => {

        if (context.canvas.id) {
            context.lineWidth = shape.lineWidth
            context.strokeStyle = shape.strokeStyle
            context.stroke()
            context.fillStyle = `rgb(${shape.color.r}, ${shape.color.g}, ${shape.color.b})`;
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

    drawAllShapes = () => {

        this.state.shapes.forEach(shape => {
            if (shape.radius) {
                this.drawCircle(shape, this.state.mainContext)
                this.drawCircle(shape, this.state.hitCtx)

            } else if (shape.width) {

                this.drawRectangle(shape, this.state.mainContext)
                this.drawRectangle(shape, this.state.hitCtx)
            }

        })
    }
    addToShapes = (shape) => {
        this.state.shapes.push(shape)
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
    render() {

        return (

            <div id="canvasDiv">
                <canvas id="canvas" height="600" width="450"></canvas>
                <p>{this.state.mode}</p>
            </div>

        )
    }
}

class Rectangle {
    constructor(posX, posY, width, height, fill, stroke, strokeWeight, rotation = 0) {
        this.posX = posX
        this.posY = posY
        this.width = width
        this.height = height
        this.color = fill
        this.stroke = stroke
        this.strokeWeight = strokeWeight
        this.colorKey = new Color(0, 0, 0)
        this.rotation = rotation
    }
    setColorKey(value) {
        this.colorKey = value
    }
    getColorKey() {
        return this.colorKey
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
    }
    setColorKey(value) {
        this.colorKey = value
    }
    getColorKey() {
        return this.colorKey
    }
}
class Color {
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }
}
