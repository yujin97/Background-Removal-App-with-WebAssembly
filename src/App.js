// src/App.js
import React, { Component }from "react";
import smile from "../img/smile.png"
import glasses from "../img/glasses.png"
import mask from "../img/mask.png"
import '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs-core';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as facemesh from '@tensorflow-models/facemesh';
import Image from './components/Image'
import Control from './components/Control'
import ArControl from './components/ArControl'
import BackendControl from './components/BackendControl'
import Dropback from '../img/dropback2.jpeg'
import Stats from 'stats.js'
import './App.css'


class App extends Component {
  
  constructor() {
    super();
    this.state = {
      backend: "wasm",
      run: false,
      arRun: false,
      stats: {},
      mode: 1,
      src: {},
      net: {},
      faceModel: {},
      faces:[],
      webcamSetting : {
        video: {
          width: {
            exact: 640
          },
          height: {
            exact: 480
          }
        },
        audio: false,
    },
    segmentation : {},
    coloredPartImage: {},
    detect: 1,
    detectMax: 6, 
    arDetect: 1,
    arDetactMax: 3, 
    arSwitch: {
      head: false,
      eye1: false,
      mask: false,
    },
    arNeeded: false
    }
    console.log('after contruction')
  }

  componentDidMount() {
    setTimeout(()=> {
      this.state.src = document.getElementById('src');
      this.startVideo();
    },1000);

    this.state.stats = new Stats();
    this.state.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    this.state.stats.dom.id = 'stats';
    document.getElementById('outputPair').appendChild(this.state.stats.dom);
    this.state.stats.dom.style.position = 'relative'
    document.getElementById('mode-1').checked = true;
  }


  predictAndDraw = async () => {
    this.state.stats.begin();
    
    if (this.state.detect == 1){
        switch(this.state.run){
          case false:
            this.state.segmentation = await this.state.net.segmentPerson(this.state.src,{
            flipHorizontal: false,
            internalResolution: 0.5,
            segmentationThreshold: 0.7
            });
            this.state.coloredPartImage = bodyPix.toMask(this.state.segmentation);
            this.setState({
              run: true
            });
            break;
          case true:
            this.updateSegmentation();
            break;
        }
        this.state.detect ++;
    } else {
      this.state.detect < this.state.detectMax ? this.state.detect ++ : this.state.detect = 1;
    }
    if (this.state.arNeeded && this.state.arDetect == 1){
      if (this.state.arRun == false){
        this.state.faces = await this.state.faceModel.estimateFaces(this.state.src);
        this.setState({
          arRun: true
        })
        console.log('first')
      } else {
        this.updateAr();
      }
    } 
    const opacity = 0.9;
    const flipHorizontal = false;
    const maskBlurAmount = 9;
    const backgroundBlurAmount = 9;
    const canvas = document.getElementById('output');
    const dropback = document.getElementById('dropback')
    switch(this.state.mode) {
      case 1:
        bodyPix.drawMask(
        canvas, this.state.src, this.state.coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal
        );
        break;
      case 2:
        const ctx = canvas.getContext("2d");
        ctx.putImageData(this.state.coloredPartImage,0,0);
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(dropback,0,0,640,480);
        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(src,0,0);
        break;
    }
    for(let i = 0; i < this.state.faces.length; i++){
      if (this.state.arSwitch['head']){
        let leftx, lefty,rightx,righty
        leftx = this.state.faces[i].boundingBox.topLeft[0][0];
        lefty = this.state.faces[i].boundingBox.topLeft[0][1];
        rightx = this.state.faces[i].boundingBox.bottomRight[0][0];
        righty = this.state.faces[i].boundingBox.bottomRight[0][1];
        let width = parseInt(rightx) - parseInt(leftx);
        let height = parseInt(righty) - parseInt(lefty);
        const faceCtx = canvas.getContext("2d")
        faceCtx.globalCompositeOperation = "source-over";
        let head = document.getElementById("headAR1");
        faceCtx.beginPath();
        faceCtx.drawImage(head,leftx,lefty,width, height);
      }
      if (this.state.arSwitch['eye1']) {
          let glasses = document.getElementById("eyeAR1");
          const keypoints = this.state.faces[i].scaledMesh;
          const leftx = keypoints[124][0];
          const lefty = keypoints[124][1];
          const rightx = keypoints[356][0];
          const righty = keypoints[356][1];
          const downy = keypoints[346][1];
          let width = parseInt(rightx) - parseInt(leftx);
          let height = parseInt(downy) - parseInt(lefty);
          const faceCtx = canvas.getContext("2d")
          faceCtx.globalCompositeOperation = "source-over";
          faceCtx.beginPath();
          faceCtx.beginPath();
          faceCtx.drawImage(glasses,leftx,lefty,width, height);
      }
      if (this.state.arSwitch['mask']) {
          let mask = document.getElementById("maskAR1");
          const keypoints = this.state.faces[i].scaledMesh;
          const leftx = keypoints[21][0];
          const lefty = keypoints[21][1];
          const rightx = keypoints[251][0];
          const righty = keypoints[251][1];
          const downy = keypoints[152][1];
          let width = parseInt(rightx) - parseInt(leftx);
          let height = parseInt(downy) - parseInt(lefty);
          const faceCtx = canvas.getContext("2d")
          faceCtx.globalCompositeOperation = "source-over";
          faceCtx.beginPath();
          faceCtx.beginPath();
          faceCtx.drawImage(mask,leftx,lefty,width, height);
      }
    }

    this.state.stats.end();
    window.requestAnimationFrame(this.predictAndDraw)
  }

  loadAndPredict = async () => {
        // using wasm. can use webgl
        await tf.setBackend('wasm');
        console.log('wasm set');

        this.state.net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.5,
        quantBytes: 4
        });

        this.state.faceModel = await facemesh.load();
        this.predictAndDraw();
      
  }
  startVideo = () => {
    navigator.mediaDevices.getUserMedia(this.state.webcamSetting)
        .then((stream) => {
            this.state.src.srcObject = stream;
            this.state.src.play();
            this.state.src.onloadeddata = () => {
              this.loadAndPredict();
            };
            // code for checking camera spec
            //console.log(stream.getVideoTracks()[0].getSettings());
        })
        .catch( (err) => {
            console.log("An error occurred! " + err);
        });
    };

  changeBackend = async (event) => {
    let newBackend = event.target.options[event.target.selectedIndex].value;
    console.log('option: ', newBackend);
    this.setState({
      backend: newBackend
    }, async () => {
      console.log(this.state.backend);
    if (this.state.backend == 'wasm'){
      console.log('change to wasm')
      await tf.setBackend('wasm');
    } else {
      console.log('change to webgl')
      await tf.setBackend('webgl');
    }
    });
  }

  changeMode = (event) => {
    this.setState({
      mode: parseInt(event.target.value)
    });
    event.target.checked = true
  }

  arSwitch = (event) => {
    this.state.arSwitch[event.target.value] =  !this.state.arSwitch[event.target.value]
    if (!this.arNeeded()){
      this.setState({
        faces: [],
        arNeeded: false,
        detectMax: 6
      })
    } else {
      this.setState({
        arNeeded: true,
        detectMax: 8
      })
    }
  }

  arNeeded = () => {
    let result = false;
    for (let [key,value] of Object.entries(this.state.arSwitch)) {
      result = result || value
    }
    return result
  }

  updateBackground = (event) => {
    if(event.target.files && event.target.files[0]){
      let dropback = document.getElementById('dropback');
      dropback.src = URL.createObjectURL(event.target.files[0]);
    }
  }

// async function for updating the segmentation data
  updateSegmentation = async () => {
    this.state.net.segmentPerson(this.state.src,{
      flipHorizontal: false,
      internalResolution: 0.5,
      segmentationThreshold: 0.7
      }).then((result) => {
        this.state.segmentation = result
        this.state.coloredPartImage = bodyPix.toMask(this.state.segmentation);
      })
  }

// async function for updating the detected face data
  updateAr = async () => {
    this.state.faceModel.estimateFaces(this.state.src).then(
        (result) => {
          this.state.faces = result;
        }
      )
  }


  render() {
    return (
      <div>
        <h2>WebAssembly Background Removal Application</h2>
        <div className ="outputContainer">
        <Image/>
        <div id = 'outputPair'>
          <canvas id ="output" width = "640" height="480"/>
        </div>
        <br/>
        <img id = 'dropback' src={Dropback} width = '640' height = '480'/>
        <img id = 'headAR1' src={smile} width = '640' height = '480'/>
        <img id = 'eyeAR1' src={glasses} width = '640' height = '480'/>
        <img id = 'maskAR1' src={mask} width = '640' height = '480'/>
        </div>
        <br/>
        <div id = 'controlPanelContainer'>
          <BackendControl backendChange = {this.changeBackend}/>
          <div id = 'controlPanel'>
            <Control changeMode = {this.changeMode}/>
            <ArControl arSwitch = {this.arSwitch}/>
          </div>
          <div id = "fileSelector">
            <p>Customize Background</p>
            <input  type = 'file' onChange = {this.updateBackground}/>
          </div>
        </div>
      </div>
  );
  }
  
};

export default App;