const PixelPusher = require('node-pixel-pusher')
const nodeCanvas = require('canvas')

const { Image } = require('canvas')

const MAX_FPS = 60;

function createRenderer(device) {
  const width = device.deviceData.pixelsPerStrip
  const height = device.deviceData.numberStrips
  const canvas = nodeCanvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`)
  
  class bubble {
    constructor(x,y) {
      this.x = x;
      this.y = y;
      this.start = Math.PI*Math.random()*2;
      this.end = Math.PI*Math.random()*2;
    }
  }

  var bubbles = [];
  for (i=0; i<4; i++) {
    for (j=0; j<4; j++) {
      bubbles.push(new bubble(8+16*i, 8+16*j));
    }
  }

  function update() {
    // Clear the entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, width, height);
    //
    
    bubbles.forEach(bubble => {
      ctx.beginPath()
      ctx.arc(bubble.x, bubble.y, 8, bubble.start, bubble.end);
      ctx.fillStyle = "#FF00FF";
      ctx.fill();
    });
    // 
  }

  device.startRendering(() => {
    // Update the canvas
    update()
    // Get data from the canvas
    const ImageData = ctx.getImageData(0, 0, width, height)
    // Send data to LEDs
    device.setRGBABuffer(ImageData.data)
  }, MAX_FPS)
}

const service = new PixelPusher.Service()

service.on('discover', (device) => {
  createRenderer(device)
})