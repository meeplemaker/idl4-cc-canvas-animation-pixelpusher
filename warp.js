const PixelPusher = require('node-pixel-pusher')
const nodeCanvas = require('canvas')

const MAX_FPS = 30;

function createRenderer(device) {
  const width = device.deviceData.pixelsPerStrip
  const height = device.deviceData.numberStrips
  const canvas = nodeCanvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`)
  
  var w = width;
  var h = height;
  var particles = [];
  var max = 200;
  var clearColor = "rgba(0, 0, 0, .2)";
  var fov = 20;
  var hue = 187;

  function random(min, max) {
		return (Math.random() * (max - min)) + min;
  }

  function P(){}

  P.prototype.init = function(){
    this.x = random(-20, 20);
    this.y = random(-20, 20);
    this.z = random(200, 300);
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.vz = random(.5, 1);
    this.color = "hsla("+hue+", 100%, 50%, .5)";
    this.size = random(5, 15);
  };
  
  P.prototype.draw = function(){
    var scale = fov/(fov+this.z);
    var x2d = this.x * scale + w/2;
    var y2d = this.y * scale + h/2;
    ctx.fillStyle = this.color;
    ctx.fillRect(x2d, y2d, this.size * scale, this.size * scale);
    
    if(x2d < 0 || x2d > w || y2d < 0 || y2d > h){
      this.init();
    }
    
    this.update();
  };
  
  
  P.prototype.update = function(){
    this.z -= this.vz;
    this.x += this.vx;
    this.y += this.vy;
    if(this.z < -fov){
      this.init();
    }
  };
  
  for(var i=0; i<max; i++){
    (function(x){
      setTimeout(function(){
        var p = new P();
        p.init();
        particles.push(p);
      }, x * 10)
    })(i)
  }

  function update() {
    ctx.fillStyle = clearColor;
    ctx.fillRect(0,0,w,h);
    
    for(var i in particles){
      particles[i].draw();
    }
    
    hue += .15;
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