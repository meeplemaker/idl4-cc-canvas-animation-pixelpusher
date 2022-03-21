const PixelPusher = require('node-pixel-pusher')
const nodeCanvas = require('canvas')
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://themotherpi.local')

const MAX_FPS = 60;

client.on('connect', function () {
  client.subscribe('input', function (err) {
    if (!err) {
      client.publish('output', 'pixelpusher is connected')
    }
  })
})

class text{
  constructor(x,y,text,color) {
    this.x = x;
    this.y = y;
    this.color = "#"+Math.floor(Math.random()*16777215).toString(16);
    this.text = text;
  }
}

textarray = []

function createRenderer(device) {
  const width = device.deviceData.pixelsPerStrip
  const height = device.deviceData.numberStrips
  const canvas = nodeCanvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`)
  
  client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    //text = message.toString();
    const x = Math.random()*width;
    const y = Math.random()*height;
    const input = message.toString();
    textarray.push(new text(x,y,input));
  })

  function update() {
    // Clear the entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(-width/2, -height/2, width, height);
    // Calculate

    // Start drawing
    ctx.font = 'normal 8pt Menlo'
    ctx.textAlign = 'center'
    textarray.forEach(obj => {

      ctx.fillStyle = obj.color;
    
      ctx.fillText(obj.text,obj.x,obj.y, 64);
    });
    //ctx.fillText(text, 0, 0, 64)
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