const PixelPusher = require('node-pixel-pusher')
const nodeCanvas = require('canvas')

const { image } = require('canvas')

const MAX_FPS = 60;

function createRenderer(device) {
  const width = device.deviceData.pixelsPerStrip
  const height = device.deviceData.numberStrips
  const canvas = nodeCanvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`)
  
  ctx.translate(width/2, height/2);
  ctx.save();

  function update() {
    // Clear the entire canvas
    ctx.restore()
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(-width, -height, width*2, height*2);
    ctx.save();
    // Calculate

    // Start drawing
    const text = 'Hello, World'
    ctx.font = 'normal 8pt Menlo'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#FF00FF'
    ctx.fillText(text, 0, 0, 64)
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