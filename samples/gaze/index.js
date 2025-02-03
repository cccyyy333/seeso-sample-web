import 'regenerator-runtime/runtime';

import {showGaze} from "../showGaze";

// npm module
import EasySeeSo from 'seeso/easy-seeso';

import key from '../../config.json';
const licenseKey = key.licenseKey;

let con=[];

// gaze callback.
function onGaze(gazeInfo) {
  // do something with gaze info.
  checkGazeInContainer(gazeInfo);
  showGaze(gazeInfo)
}

// debug callback.
function onDebug(FPS, latency_min, latency_max, latency_avg){
  // do something with debug info.
}


async function main() {

  
  const seeSo = new EasySeeSo();
  /**
   * set monitor size.    default: 16 inch.
   * set face distance.   default: 30 cm.
   * set camera position. default:
   * camera x: right center
   * cameraOnTop: true
   */

  await seeSo.init(licenseKey,
      () => {
      seeSo.setMonitorSize(13);
      seeSo.setFaceDistance(40);
      seeSo.setCameraPosition(window.outerWidth / 2, true);
      seeSo.startTracking(onGaze, onDebug)
            }, // callback when init succeeded.
      () => console.log("callback when init failed"),  // callback when init failed.
  )

  

}

(async () => {
  await main();
})()





function checkGazeInContainer(gazeInfo) {
  con.forEach((container) => {
    const rect = container.getBoundingClientRect();
    if (
      gazeInfo.x >= rect.left &&
      gazeInfo.x <= rect.right &&
      gazeInfo.y >= rect.top &&
      gazeInfo.y <= rect.bottom
    ) {
      container.style.backgroundColor = "green"; // Change color when the gaze is inside
    } else {
      container.style.backgroundColor = "gray"; // Revert color when the gaze is outside
    }
  });
}


function container_init() {
  for (let i = 0; i < 3; i++) {
    const elementId = String.fromCharCode(97 + i); // 'a', 'b', 'c'
    con[i] = document.getElementById(elementId);
    con[i].style.backgroundColor = "gray";
    con[i].style.fontSize = "30px";
    con[i].style.display = "inline-block"
    con[i].style.width = "200px";
    con[i].style.height = "200px";
    con[i].style.textAlign = "center";
    con[i].style.lineHeight = "200px"; 
    con[i].style.margin= "100px"
  }
}

document.addEventListener("DOMContentLoaded", () => {
  container_init();
});