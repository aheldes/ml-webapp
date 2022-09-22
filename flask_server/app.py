from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit
import io
from PIL import Image
import base64, cv2
import numpy as np
import cv2
import cvzone
from cvzone.FaceMeshModule import FaceMeshDetector
from cvzone.PlotModule import LivePlot

app = Flask(__name__)
socketio = SocketIO(app,cors_allowed_origins='*' )

@app.route('/', methods=['POST', 'GET'])
def index():
    return render_template('index.html')

@app.route('/api', methods=['POST', 'GET'])
def api():
    return jsonify({'statuses': ['error', 'success', 'warning']})


def readb64(base64_string):
    idx = base64_string.find('base64,')
    base64_string  = base64_string[idx+7:]

    sbuf = io.BytesIO()

    sbuf.write(base64.b64decode(base64_string, ' /'))
    pimg = Image.open(sbuf)

    return cv2.cvtColor(np.array(pimg), cv2.COLOR_RGB2BGR)

global detector, plotY, idList, color
detector = FaceMeshDetector(maxFaces=1)
plotY = LivePlot(640, 360, [20, 50], invert=True)
idList = [22, 23, 24, 26, 110, 130, 157, 158, 159, 160, 161, 243]
ratioList = []
color = (255, 0, 255)

@socketio.on('image')
def image(data_image):
    global detector, plotY, idList, color
    frame = (readb64(data_image))
    frame = cv2.resize(frame, (0,0), None, 1, 1)
    
    blinked = False

    img, faces = detector.findFaceMesh(frame, draw=False)

    if faces:
        face = faces[0]
        for id in idList:
            cv2.circle(img, face[id], 5, color, cv2.FILLED)

        leftUp = face[159]
        leftDown = face[23]
        leftLeft = face[130]
        leftRight = face[243]
        lenghtVer, _ = detector.findDistance(leftUp, leftDown)
        lenghtHor, _ = detector.findDistance(leftLeft, leftRight)

        cv2.line(img, leftUp, leftDown, (0, 200, 0), 3)
        cv2.line(img, leftLeft, leftRight, (0, 200, 0), 3)

        ratio = int((lenghtVer / lenghtHor) * 100)
        ratioList.append(ratio)
        if len(ratioList) > 3:
            ratioList.pop(0)
        ratioAvg = sum(ratioList) / len(ratioList)

        if ratioAvg < 35:
            blinked = True

    img = cv2.resize(img, (640, 360))

    imgencode = cv2.imencode('.jpeg', img, [cv2.IMWRITE_JPEG_QUALITY,40])[1]

    # base64 encode
    stringData = base64.b64encode(imgencode).decode('utf-8')
    b64_src = 'data:image/jpeg;base64,'
    stringData = b64_src + stringData

    # emit the frame back
    emit('response_back', {'image': stringData, 'blinked': blinked})


if __name__ == '__main__':
    socketio.run(app, port=9990, debug=True)