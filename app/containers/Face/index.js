/*
 *
 * Home
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import Canvas from "../../components/canvas"
import clm from 'clmtrackr';

import './style.css';
import './styleM.css';

export default class Home extends React.PureComponent {

  constructor() {
    super();
    this.state = {
      //capture
      vid: "",
      vidWidth: 0,
      vidHeight: 0,
      overlay: "",
      overlayCC: "",
      trackingStarted: false,
      startValue: "Waiting",
      startDisabled: true,
      //nose
      noseAngle: "",
      noseStart: null,
      noseScrunch: false,
      noseScrunchHeld: false,
      noseCounter: 0,
      noseDist: 0,
      noseNorm: null,
      nosePrev: null,
      nosePosition: "",
      //eyebrows
      leftEyebrowDist: 0,
      rightEyebrowDist: 0,
      leftEyebrowPrev: null,
      rightEyebrowPrev: null,
      eyebrows: false,
      eyebrowCounter: 0,
      eyebrowsHeld: false,
      //mouth
      mouthDist: 0,
      //face
      faceDirection: "still",
      faceToMove: "",
      faceWidth: 0,
      faceWidthStart: 0, 
      //other
      setTimeout: false
    }
  }
 

  componentWillMount() {
    this.ctrack = new clm.tracker({ useWebGL: true });
    this.ctrack.init();
  }

  componentDidMount() {
    let vid = document.getElementById('videoel');
    let overlay = document.getElementById('overlay');
    let overlayCC = overlay.getContext('2d');

    this.setState({
      vid: vid
    }, () => {
      this.setState({
        vidWidth: vid.width,
        vidHeight: vid.height,
        overlay: overlay,
        overlayCC: overlayCC
      })
    })

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
    // check for camerasupport
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(this.gumSuccess).catch(this.gumFail);
    } else if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true }, this.gumSuccess, this.gumFail);
    } else {
      alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
    }
    vid.addEventListener('canplay', this.enablestart, false);
  }
  componentDidUpdate() {
    if (this.props.isRunning) {
      this.startVideo()
    }
  }

  //reset parameters
  componentWillUnmount() {
    this.setState({
      noseAngle: "",
      eyebrowDist: 0,
      mouthDist: 0,
      noseScrunch: false,
      noseDist: 0,
      noseNorm: null,
      nosePrev: null,
      faceDirection: "still",
      setTimeout: false,
      rightEyebrowPrev: null,
      leftEyebrowPrev: null,
      rightEyebrowDist: null,
      leftEyebrowDist: null,
    })
  }

  enablestart = () => {
    this.setState({
      startValue: "Start",
      startDisabled: false
    })
  }

  adjustVideoProportions = () => {
    // resize overlay and video if proportions are different
    // keep same height, just change width

    let vid = this.state.vid;
    let overlay = this.state.overlay;

    let proportion = vid.videoWidth / vid.videoHeight;
    let vidWidth = Math.round(this.state.vidHeight * proportion);

    vid.width = vidWidth;
    overlay.width = vidWidth;

    this.setState({
      vid: vid,
      overlay: overlay
    })
  }

  gumSuccess = (stream) => {
    // add camera stream if getUserMedia succeeded
    let vid = this.state.vid;

    if ("srcObject" in vid) {
      vid.srcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream));
    }
    vid.onloadedmetadata = () => {
      this.adjustVideoProportions();
      vid.play();
    }
    vid.onresize = () => {
      this.adjustVideoProportions();
      if (this.state.trackingStarted) {
        this.ctrack.stop();
        this.ctrack.reset();
        this.ctrack.start(vid);
      }
    }
  }

  gumFail = () => {
    alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
  }

  startVideo = () => {
    // start video
    this.state.vid.play();
    // start tracking
    this.ctrack.start(this.state.vid);
    this.setState({
      trackinStarted: true
    })
    // start loop to draw face 
    this.drawLoop();
  }

  drawLoop = () => {
    requestAnimFrame(this.drawLoop);
    this.state.overlayCC.clearRect(0, 0, this.state.vidWidth, this.state.vidHeight);
    if (this.ctrack.getCurrentPosition()) {
      this.ctrack.draw(this.state.overlay);
    }
    let cp = this.ctrack.getCurrentPosition();
    if (cp === false || this.props.isRunning === false) {
    
    } else {
      //leftEyebrow: 24, 21
      //right eyebrow 17, 29
      //nose length 33, 62
      //mouth range: 1-24
      //this.props.setFace(true)
      let angle = this.returnAngle(cp)
      let mouthDistance = this.returnDistance(cp[60], cp[57])
      let noseLength = this.returnDistance(cp[33], cp[39])
      let leftEyebrowDist = this.returnDistance(cp[24], cp[21])
      let rightEyebrowDist = this.returnDistance(cp[17], cp[29])
      let faceWidth = this.returnDistance(cp[0], cp[14])
      //set defaults when face is found
      if (this.state.noseNorm === null) {
        this.setState({
          noseNorm: noseLength, nosePrev: noseLength, rightEyebrowDist: rightEyebrowDist, leftEyebrowDist: leftEyebrowDist, mouthDist: mouthDistance, noseAngle: angle,
          leftEyebrowPrev: leftEyebrowDist, rightEyebrowPrev: rightEyebrowDist, noseStart: noseLength, faceWidth: faceWidth, faceWidthStart: faceWidth, nosePosition: cp[62],
          eyebrowCounter: setInterval(() => { this.setState({ eyebrowCounter: this.state.eyebrowCounter + 1 }) }, 500),
          noseCounter: setInterval(() => { this.setState({ noseCounter: this.state.noseCounter + 1 }) }, 500)
        })
      }
      //set timeouts here
      if (this.state.setTimeout === false) {
        setInterval(this.updatePrev, 500)
        this.setState({ setTimeout: true })
      }
      //determine if face is moving forward backward or is still
      this.faceMovementDirection(noseLength)
      //update the  nose's length, left and right eyebrow length, face width, nose position
      if(this.state.noseNorm !== null){
      this.setState({  faceWidth: faceWidth, leftEyebrowDist: leftEyebrowDist, rightEyebrowDist: rightEyebrowDist, noseDist: noseLength, nosePosition:cp[62] })
      }
      //check if face is too far, too close or in right position
      this.isCloseToStart()
      //if face is in the right position do things
      if (this.state.faceToMove === 0) {
        this.determineEyebrowsUp(leftEyebrowDist, rightEyebrowDist)
        this.determineEyebrowsHeld()
        this.determineNoseScrunched(noseLength)
        this.determineNoseScrunchedHeld()
        this.setState({mouthDist: mouthDistance, noseAngle: angle})
      }

    }
  }
  isCloseToStart = () => {
    if (this.faceStartToFaceCur() > 7) {
      this.setState({ faceToMove: 1 })
    } else if (this.faceStartToFaceCur() < -10) {
      this.setState({ faceToMove: 2 })
    } else if(this.state.faceToMove !== 0) {
      this.setState({ faceToMove: 0 })
    }
  }
  faceStartToFaceCur = () => {
    return this.state.faceWidthStart - this.state.faceWidth
  }

  determineNoseScrunched = (nose) => {

    if (this.state.noseStart - nose > 2) {
      this.setState({ noseScrunch: true })
    } else {
      this.setState({ noseScrunch: false })
    }
  }
  determineNoseScrunchedHeld = () => {
    if (this.state.noseScrunch === true) {
      this.state.noseCounter
    } else {
      this.setState({ noseCounter: 0, noseScrunchHeld: false })
      clearInterval(this.state.noseCounter)
    }
    if (this.state.noseCounter >= 2) {
      this.setState({ noseScrunchHeld: true })
    }
  }
  determineEyebrowsUp = (left, right) => {
    if (this.state.leftEyebrowDist - this.state.leftEyebrowPrev > 3 || this.state.rightEyebrowDist - this.state.rightEyebrowPrev > 3) {
      this.setState({ eyebrows: true })
    } else {
      this.setState({ eyebrows: false })
    }
  }

  determineEyebrowsHeld = () => {

    if (this.state.eyebrows === true) {
      this.state.eyebrowCounter
    } else {
      this.setState({ eyebrowCounter: 0, eyebrowsHeld: false })
      clearInterval(this.state.eyebrowCounter)
    }
    if (this.state.eyebrowCounter >= 2) {
      this.setState({ eyebrowsHeld: true })
    }
  }
  faceMovementDirection = (length) => {
    if (this.state.nosePrev - length < -2) {
      this.setState({ faceDirection: "forward" })
    } else if (this.state.nosePrev - length > 2) {
      this.setState({ faceDirection: "backward" })
    } else {
      this.setState({ faceDirection: "still", noseNorm: length })
    }
  }
  //update nose distance every call but not other face parameters if the face is moving forward or backward
  updatePrev = () => {
    this.setState({ nosePrev: this.state.noseDist })
  }
  mapRange = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
  }
  returnAngle = (cp) => {
    let p1 = cp[33]
    let p2 = cp[62]
    let slope = (p2[1] - p1[1]) / (p2[0] - p1[0])
    let radians = Math.atan(slope)
    return this.radiansToDegrees(radians)
  }
  returnDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))
  }

  radiansToDegrees = (radians) => {
    let pi = 3.14159265359
    return radians * 180 / pi
  }

  render() {
    return (
      <div className="container">
        <Helmet title="Home" meta={[{ name: 'description', content: 'Description of Home' }]} />
        <div id="container">
          <video id="videoel" width="400" height="300" preload="auto" loop playsInline autoPlay></video>
          <canvas id="overlay" width="400" height="300"></canvas>
          <p>{this.state.faceToMove === 0 ? "You do not need to move" : this.state.faceToMove === 1 ? "You are too far away" : "You are too close"}</p>
          <p>{this.state.eyebrows ? "Eyebrows are up" : "Eyebrows are down"}</p>
          <p>{this.state.eyebrowsHeld ? "Eyebrows are held" : "Eyebrows are not held"}</p>
          <p>{this.state.noseScrunch ? "Nose is scrunched" : "Nose is not scrunched"}</p>
          <p>{this.state.noseScrunchHeld ? "Nose scrunched is held" : "Nose scrunched is not held"}</p>
          <p>Your mouth is this many pixels open: {Math.floor(this.state.mouthDist)}</p>
          <p>The angle of your face is : {Math.floor(this.state.noseAngle)}</p>
         <p>Nose is at position x:{this.state.nosePosition === "" ? " ":Math.floor(this.state.nosePosition[0])} y:{this.state.nosePosition===" "? " ": Math.floor(this.state.nosePosition[1])}</p>
          <button onClick={this.startVideo}>Start</button>
          <Canvas mouthDist={this.state.mouthDist} nosePosition={this.state.nosePosition}faceToMove={this.state.faceToMove} noseAngle={this.state.noseAngle} eyebrowsHeld={this.state.eyebrowsHeld} eyebrows={this.state.eyebrows} noseScrunchHeld={this.state.noseScrunchHeld} noseScrunch={this.state.noseScrunch}></Canvas>
        </div>
      </div>
    );
  }
}







// Helper Functions
/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
      return window.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * Provides cancelRequestAnimationFrame in a cross browser way.
 */
window.cancelRequestAnimFrame = (function () {
  return window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.clearTimeout;
})();
