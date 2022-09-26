import { FaceMesh} from "@mediapipe/face_mesh";
import React, { useRef, useState } from "react";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import Webcam from "react-webcam";
import { settings } from "./utils/settings";

function App() {
  const [checkedSettings, setCheckedSettings] = useState(
    new Array(settings.length).fill(false)
  );

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useRef(null);

  const handleOnChange = (position) => {
    const updateCheckedSettings = checkedSettings.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedSettings(updateCheckedSettings);
  };

  const onResults = (results) => {
    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
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
    canvasCtx.restore();
  }

  
  class GameTrigger extends React.Component {
    constructor(props) {
      super(props);
      this.state = { gameOn: false };

      this.handleOnClick = this.handleOnClick.bind(this)
      // this.text = this.text()
    }

    startGame = () => {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        selfie: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      faceMesh.onResults(onResults);

      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null
      ) {
        camera.current = new cam.Camera(webcamRef.current.video, {
          onFrame: async () => {
            await faceMesh.send({ image: webcamRef.current.video });
          },
          width: 1280,
          height: 720,
        });
        camera.current.start();
      }
      this.setState({ gameOn: true });
    }

    stopGame = () => {
      camera.current.stop();
      this.setState({ gameOn: false });
    }


    handleOnClick = () => {
      if (this.state.gameOn) {
        this.stopGame();
      } else {
        this.startGame();
      }

    }

    // text = () => {
    //   if (this.state.gameOn) {
    //     console.log('1')
    //     return "End game"
    //   }
    //   console.log('2')
    //    return "Start game"
    // }
  
  
    render() {
      const gameOn = this.state.gameOn;
      return (
        <button onClick={this.handleOnClick}
          style={{
            position: "absolute",
              zindex: 9,
              top: 0,
          }}>
          {gameOn ? "End game" : "Start game"}
        </button>
      );
    }
  }

  return (
    <center>
      <div className="App">
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
        {settings.map(({ name }, index) => {
          return (
            <li key={index} style={{
              position: "absolute",
              zindex: 9,
              top: 10+index*20,
            }}>
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
        <GameTrigger />
      </div>
    </center>
  )
}

export default App;