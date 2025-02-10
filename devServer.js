const express = require('express');
const http = require('http');
const open = require('open');
const { default: Parcel } = require('@parcel/core');
const path = require('path');
const bodyParser = require('body-parser'); // 추가된 부분

const app = express();
const bundlePath = process.argv[2];
const port = process.argv[3];

// Cross-Origin headers 설정
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*'); // 필요에 따라 수정 가능
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// JSON 본문 파싱을 위한 미들웨어
app.use(bodyParser.json()); // POST 본문을 JSON으로 파싱하도록 설정

// POST 요청 처리
app.post('/gaze', (req, res) => {
    //console.log('Received gaze data:', req.body);  // 요청 데이터 확인
    
    const { page, gazeRecord } = req.body;  // 요청 데이터에서 page와 gazeInfo 추출
    
    if (!page || !gazeRecord) {
        return res.status(400).send({ success: false, error: 'Missing page or gazeInfo' });
    }

    // 시선 데이터를 저장할 JSON 파일 업데이트
    saveGazeData(page, gazeRecord);

    res.status(200).send({ success: true });
});


// Parcel 빌드 및 파일 서빙
(async () => {
    const bundler = new Parcel({
        entries: path.resolve(bundlePath),
        defaultConfig: '@parcel/config-default',
        mode: 'development',
        target: 'browser',
        serveOptions: {
            port: 0, // Parcel dev server에서 사용할 임의의 포트
        },
    });

    await bundler.run(); // Parcel 빌드 실행

    const distDir = path.join(process.cwd(), 'dist'); // 기본 빌드 출력 디렉토리
    app.use(express.static(distDir)); // 빌드된 파일을 정적으로 서빙

    // 서버 실행
    const server = http.createServer(app);
    server.listen(port, () => {
        console.info('Server is running');
        console.info(`  NODE_ENV=[${process.env.NODE_ENV}]`);
        console.info(`  Port=[${port}]`);
        open(`http://localhost:${port}`);
    });
    
    // Puppeteer 크롤링 코드
    const puppeteer = require('puppeteer');
// POST 요청으로 페이지 URL을 받아 DOM 구조 추출
    app.post('/scrape', async (req, res) => {
        const { url } = req.body; // 클라이언트로부터 URL 받기
    
        if (!url) {
        return res.status(400).send({ error: 'URL is required' });
        }
    
        try {
        // Puppeteer로 브라우저 실행
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
    
        // 페이지 로드
        await page.goto(url, { waitUntil: 'networkidle2' });
    
        // DOM 구조 추출
        const domStructure = await page.evaluate(() => {
            const elements = [...document.querySelectorAll('*')]; // 모든 요소 선택
            return elements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
                tag: el.tagName.toLowerCase(),
                class: el.className,
                id: el.id,
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height
            };
            });
        });
    
        // 브라우저 종료
        await browser.close();    
        saveDomData(url, domStructure);    
        // DOM 구조를 클라이언트로 반환
        res.json({ success: true, dom: domStructure });
        } catch (error) {
        console.error('Error scraping the page:', error);
        res.status(500).send({ success: false, error: error.message });
        }
    });
})();


const fs = require('fs');

function saveGazeData(page, data) {
    const dir = path.join(__dirname, 'gaze_data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${page.replace(/[^a-zA-Z0-9]/g, '_')}.json`);

    let existingData = [];
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
            existingData = JSON.parse(fileContent);
        } catch (error) {
            console.error('Error parsing existing gaze data:', error);
        }
    }

    existingData.push(data); // 새로운 데이터 추가

    fs.writeFile(filePath, JSON.stringify(existingData, null, 2), (err) => {
        if (err) console.error('Error saving gaze data:', err);
        else console.log(`Gaze data saved to ${filePath}`);
    });
}

function saveDomData(url, domData) {
    const dir = path.join(__dirname, 'dom_data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = url.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    const filePath = path.join(dir, fileName);

    fs.writeFile(filePath, JSON.stringify(domData, null, 2), (err) => {
        if (err) console.error('Error saving DOM data:', err);
        else console.log(`DOM data saved to ${filePath}`);
    });
}


