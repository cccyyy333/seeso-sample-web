import 'regenerator-runtime/runtime';
import EasySeeSo from 'seeso/easy-seeso';


import key from '../../config.json';
const licenseKey = key.licenseKey;

let gazeData = []; // 시선 데이터를 저장할 배열
let currentPage = ''; // 현재 페이지 URL


function onGaze(gazeInfo) {
  gazeData.push({ timestamp: Date.now(), gazeInfo });
  console.log('Current gaze:',gazeInfo)
  // 서버로 실시간 데이터 전송
  fetch('http://localhost:8082/gaze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: currentPage,
      gazeInfo,
    }),
  }).catch((error) => console.error('Failed to send gaze data:', error));
}

function onDebug(FPS, latency_min, latency_max, latency_avg){
  // do something with debug info.
  
}

// 페이지 이동 추적 및 데이터 초기화
function onPageChange(newPage) {
  if (newPage !== currentPage) {
    // 이전 페이지 데이터를 서버에 저장
    if (gazeData.length > 0) {
      fetch('http://localhost:8082/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: currentPage,
          data: gazeData,
        }),
      }).catch((error) => console.error('Failed to save data:', error));
    }

    // 새로운 페이지로 초기화
    currentPage = newPage;
    gazeData = [];
    console.log(`Switched to new page: ${newPage}`);
  }
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

  // 외부 사이트 로드
  const iframe = document.createElement('iframe');
  iframe.src = 'http://127.0.0.1:52273/'; // 샘플 사이트 URL
  iframe.style.width = '100%';
  iframe.style.height = '100vh';
  document.body.appendChild(iframe);

  // 페이지 이동 감지
  iframe.onload = () => {
    const newPage = iframe.contentWindow.location.href;
    onPageChange(newPage);
  };
}

main();
