import 'regenerator-runtime/runtime';
import EasySeeSo from 'seeso/easy-seeso';

//import {showGaze} from "../showGaze";

import config from '../../config.json';

import DOMTracker from "../getDOMdata"
const host ='http://localhost:8082';
const target ='https://www.google.com/';
//http://127.0.0.1:52273
const tracker = new DOMTracker(config.host, config.target-g);

const licenseKey = config.licenseKey;



function onGaze(gazeInfo) {
 tracker.makeDataset(gazeInfo)
}


function onDebug(FPS, latency_min, latency_max, latency_avg){
}


// Seeso 초기화 및 추적 시작
async function main() {
  const seeSo = new EasySeeSo();
  await seeSo.init(licenseKey,
    () => {
    seeSo.setMonitorSize(13);
    seeSo.setFaceDistance(40);
    seeSo.setCameraPosition(window.outerWidth / 2, true);
    seeSo.startTracking(onGaze, onDebug)
          }, // callback when init succeeded.
    () => console.log("callback when init failed"),  // callback when init failed.
)
tracker.setupDom();
}

main();




