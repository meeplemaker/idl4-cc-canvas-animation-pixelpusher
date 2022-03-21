const PixelPusher = require('node-pixel-pusher')
const nodeCanvas = require('canvas')

const MAX_FPS = 60;

function createRenderer(device) {
  const width = device.deviceData.pixelsPerStrip
  const height = device.deviceData.numberStrips
  const canvas = nodeCanvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`)
  
  ctx.translate(width/2, height/2);
  ctx.save();

  var rotation = 0;
  var counter = 0;

  function update() {
    // Clear the entire canvas
    ctx.restore()
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(-width, -height, width*2, height*2);
    ctx.save();
    // calculiations
    rotation = Date.now()/1000*90;
    rotation = rotation%360; 
    // console.log(rotation); 
    // Start drawing on the canvas
    ctx.rotate(Math.PI*2/360*rotation);
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(-width/2,-height/2, width, height/2);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(-width/2, 0, width, height/2);
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
  console.log(device)
  createRenderer(device)
})