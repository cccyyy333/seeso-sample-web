import 'regenerator-runtime/runtime';
import EasySeeSo from "seeso/easy-seeso"
import {showGaze, hideGaze} from "../showGaze";
import DOMTracker from "../getDOMdata"
const host ='http://localhost:8082';
const target ='http://www.google.com/';
//http://127.0.0.1:52273
const tracker = new DOMTracker(host, target);



import key from '../../config.json';
const licenseKey = key.licenseKey;

const dotMaxSize = 10;
const dotMinSize = 5;

let isCalibrationMode = false;
let isCollectMode=false;
let eyeTracker = null;
let currentX, currentY;
let calibrationButton;



function onClickCalibrationBtn() {
  if(!isCalibrationMode){
    isCalibrationMode = true;
    hideGaze()
    eyeTracker.hideImage()
    let focusText = showFocusText();
    setTimeout(function() {
      hideFocusText(focusText);
      eyeTracker.startCalibration(onCalibrationNextPoint, onCalibrationProgress, onCalibrationFinished)
    }, 2000);
    calibrationButton.style.display = 'none';
    hideCalibrationTitle()
  }
}

// gaze callback.
function onGaze(gazeInfo) {
  if(!isCalibrationMode){
      // do something with gaze info.
      if(isCollectMode){
        tracker.makeDataset(gazeInfo)
      }
      else{
        showGaze(gazeInfo)
      }
      //checkGazeInContainer(gazeInfo)
  }else {
      hideGaze()
  }

  


}

// calibration callback.
function onCalibrationNextPoint(pointX, pointY) {
  currentX = pointX
  currentY = pointY
  let ctx = clearCanvas()
  drawCircle(currentX, currentY, dotMinSize, ctx)
  eyeTracker.startCollectSamples()
}

function onCalibrationProgress(progress) {
  let ctx = clearCanvas()
  let dotSize = dotMinSize + (dotMaxSize - dotMinSize) * progress; 
  drawCircle(currentX, currentY, dotSize, ctx)
}

function drawCircle(x,y,dotSize, ctx){
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(x, y, dotSize, 0, Math.PI * 2, true);
  ctx.fill();
}

function onCalibrationFinished(calibrationData) {
  clearCanvas()
  isCalibrationMode = false;
  calibrationButton.style.display = 'block';
  eyeTracker.showImage()
  showCalibrationTitle()
}

function clearCanvas() {
  let canvas = document.getElementById("output");
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

function showFocusText() {
  let focusText = document.createElement("div");
  focusText.innerText = "focus on point";
  focusText.style.position = "fixed";
  focusText.style.top = "50%";
  focusText.style.left = "50%";
  focusText.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(focusText);
  return focusText;
}

function hideFocusText(focusText) {
  document.body.removeChild(focusText);
}

// debug callback.
function onDebug(FPS, latency_min, latency_max, latency_avg){
    // do something with debug info.
}

function hideCalibrationTitle() {
  const calibrationTitle = document.getElementById("calibrationTitle");
  calibrationTitle.style.display = "none";
}

function showCalibrationTitle() {
  const calibrationTitle = document.getElementById("calibrationTitle");
  calibrationTitle.style.display = "block";
  //showContainers();
  addDataCollectionButton(); //데이터 수집 버튼
}

async function main() {
  if (!calibrationButton) {
    calibrationButton = document.getElementById('calibrationButton');
    calibrationButton.addEventListener('click', onClickCalibrationBtn);
    calibrationButton.disabled = true;
  }

  if (!eyeTracker) {
    eyeTracker = new EasySeeSo();
    await eyeTracker.init(licenseKey,
      async () => {
        await eyeTracker.startTracking(onGaze, onDebug);
        eyeTracker.showImage();
        if (!eyeTracker.checkMobile()) {
          eyeTracker.setMonitorSize(13); // 14 inch
          eyeTracker.setFaceDistance(30);
          eyeTracker.setCameraPosition(window.outerWidth / 2, true);
        }
        calibrationButton.disabled = false;
      }, // callback when init succeeded.
      () => console.log("callback when init failed.") // callback when init failed.
    );
  } else {
    calibrationButton.disabled = false;
  }
}

// Add the data collection button
function addDataCollectionButton() {
  const dataCollectionButton = document.createElement('button');
  dataCollectionButton.innerText = 'Start Data Collection';
  dataCollectionButton.style.position = 'fixed';
  dataCollectionButton.style.bottom = '20px';
  dataCollectionButton.style.left = '50%';
  dataCollectionButton.style.transform = 'translateX(-50%)';
  document.body.appendChild(dataCollectionButton);

  // On click, trigger setup_Dom function
  dataCollectionButton.addEventListener('click', () => {
    isCollectMode=true;
    tracker.setupDom(); // Calls the setup_Dom function to initiate the data collection iframe
    dataCollectionButton.style.display = 'none'; // Hide the button after clicking
  });
}

(async () => {
  await main();
})();



