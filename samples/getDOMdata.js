class DOMTracker {
  constructor(serverUrl, iframeUrl) {
    this.serverUrl = serverUrl;
    this.iframeUrl = iframeUrl;
    this.domElements = [];
  }

  async setupDom() {
    document.body.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = this.iframeUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    document.body.appendChild(iframe);
    await this.fetchDomStructure(this.iframeUrl);
  }

  async fetchDomStructure(url) {
    try {
      const response = await fetch(`${this.serverUrl}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('Received DOM structure:', data.dom);
        this.domElements = this.extractBoundingBoxes(data.dom);
      } else {
        console.error('Failed to fetch DOM:', data.error);
      }
    } catch (error) {
      console.error('Error while fetching DOM:', error);
    }
  }

  extractBoundingBoxes(domData) {
    return domData.map(element => ({
      tag: element.tag,
      id: element.id || '',
      class: element.class || '',
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    }));
  }

  matchGazeToElements(gazeInfo) {
    const { x, y } = gazeInfo;
    return this.domElements.filter(element =>
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );
  }

  async makeDataset(gazeInfo) {
    const matchedElements = this.matchGazeToElements(gazeInfo);
    const payload = {
      page: window.location.href,
      gazeRecord: {
        timestamp: Date.now(),
        gazeInfo,
        matchedElements
      }
    };
    
    try {
      const response = await fetch(`${this.serverUrl}/gaze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server Error: ${errorData.error}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to send gaze data:', error);
    }
  }
}

export default DOMTracker;
