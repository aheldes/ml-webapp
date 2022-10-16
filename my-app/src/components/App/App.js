import { FaceMesh } from "@mediapipe/face_mesh";
import { FaceDetection } from '@mediapipe/face_detection';
import React, { useRef, useState, useEffect } from "react";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, drawRectangle } from "@mediapipe/drawing_utils";
import Webcam from "react-webcam";
import { settings } from "./settings";

function App() {
  const [checkedSettings, setCheckedSettings] = useState(
    new Array(settings.length).fill(false)
  );

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useRef(null);
  
  let faceDetectionArray = [];
  const [state, setState] = useState(
    {gameOn: false}
  );

  const handleOnChange = (position) => {
    const updateCheckedSettings = checkedSettings.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedSettings(updateCheckedSettings);
  };

  const startGame = () => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });


    faceMesh.setOptions({
      refineLandmarks: true,
      selfie: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      maxNumFaces: 2,
    });

    const onResults = (results) => {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
  
      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
  
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      //canvasCtx.save();
      //canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
  
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          settings.forEach((setting, index) => {
            if (setting.type === "connector" && checkedSettings[index]) {
              drawConnectors(canvasCtx, landmarks, setting.attribute, setting.style);
            } else if (setting.type === "landmark" && checkedSettings[index]) {
              drawLandmarks(canvasCtx, landmarks, setting.style);
            }
          });
        };
      };
      for (const faceDetection of faceDetectionArray) {
        drawRectangle(canvasCtx, faceDetection.boundingBox, {color: 'blue', lineWidth: 4, fillColor: '#00000000'});
      };
      canvasCtx.restore();
    }
    
    faceMesh.onResults(onResults);

    const faceDetection = new FaceDetection(
      {locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
    }});

    const faceDetectionOnResults = (results) => {
      if (results.detections) {
        faceDetectionArray = results.detections;
      }
    }

    faceDetection.onResults(faceDetectionOnResults);

    faceDetection.setOptions({
      selfie: true,
      model: 'short',
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      maxNumFaces: 2,
    });

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceDetection.send({ image: webcamRef.current.video });
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720,
      });
      camera.current.start();
    }
    setState({ gameOn: true });
  };

  const stopGame = () => {
    camera.current.stop();
    setState({ gameOn: false });
  };

  const gameTrigger = () => {
    if (state.gameOn) {
      stopGame();
    } else {
      startGame();
    }
  };

  return (
    <center>
      <div className="App">
        {settings.map(({ name }, index) => {
          return (
            <li key={index} style={{
              position: "absolute",
              zindex: 9,
              top: 10+index*20,
            }}>
              <Webcam
         muted={true}
         ref={webcamRef}
         style={{
          width: "0%", height: "0%"
          }}
        />
        <canvas
          ref={canvasRef}
          className="output_canvas"
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            top: 640,
            textAlign: "center",
            zindex: 9,
            width: 1280,
            height: 720,
          }}
        ></canvas>
              <input
                type="checkbox"
                id={`custom-checkbox-${index}`}
                name={name}
                value={name}
                checked={checkedSettings[index]}
                onChange={() => handleOnChange(index)}
              />
              <label htmlFor={`custom-checkbox-${index}`}>{name}</label>
            </li>
          )
        })}
        <button 
        style={{
          position: "absolute",
          zindex: 20,
          top: 10,
          left: 10,
        }}
          onClick={gameTrigger}>{state.gameOn ? "Stop" : "Start"}</button>
      </div>
    </center>
  )
}

export default App;
