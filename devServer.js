const express = require('express');
const http = require('http');
const open = require('open');
const { default: Parcel } = require('@parcel/core');
const puppeteer = require('puppeteer-core');
const path = require('path');

const app = express();
const bundlePath = process.argv[2];
const port = process.argv[3];

// Cross-Origin headers 설정
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

// Puppeteer API
app.get('/scrape', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send({ error: 'URL is required' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // 원하는 정보를 가져옵니다.
        const title = await page.title();
        const content = await page.content();

        await browser.close();

        res.send({ success: true, title, content });
    } catch (error) {
        console.error('Error scraping:', error);
        res.status(500).send({ success: false, error: error.message });
    }
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
})();
