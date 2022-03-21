const PixelPusher = require('node-pixel-pusher')
const nodeCanvas = require('canvas')

const MAX_FPS = 60

function createRenderer(device) {
  const width = device.deviceData.pixelsPerStrip
  const height = device.deviceData.numberStrips
  const canvas = nodeCanvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`)
  
  let rotation = 0; // Rotation of the globe
  let dots = []; // Every dots in an array

  let counter = 0; // Counter

  /* ====================== */
/* ====== CONSTANTS ===== */
/* ====================== */
/* Some of those constants may change if the user resizes their screen but I still strongly believe they belong to the Constants part of the variables */
const DOTS_AMOUNT = 120; // Amount of dots on the screen
const DOT_RADIUS = 10; // Radius of the dots
let GLOBE_RADIUS = width * 0.7; // Radius of the globe
let GLOBE_CENTER_Z = -GLOBE_RADIUS; // Z value of the globe center
let PROJECTION_CENTER_X = width / 2; // X center of the canvas HTML
let PROJECTION_CENTER_Y = height / 2; // Y center of the canvas HTML
let FIELD_OF_VIEW = width * 0.5;

class Dot {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.xProject = 0;
    this.yProject = 0;
    this.sizeProjection = 0;

    this.color = "FFFFFF";//Math.floor(Math.random()*16777215).toString(16);
  }
  // Do some math to project the 3D position into the 2D canvas
  project(sin, cos) {
    const rotX = cos * this.x + sin * (this.z - GLOBE_CENTER_Z);
    const rotZ = -sin * this.x + cos * (this.z - GLOBE_CENTER_Z) + GLOBE_CENTER_Z;
    this.sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW - rotZ);
    this.xProject = (rotX * this.sizeProjection) + PROJECTION_CENTER_X;
    this.yProject = (this.y * this.sizeProjection) + PROJECTION_CENTER_Y;
  }
  // Draw the dot on the canvas
  draw() {
    ctx.beginPath();
    ctx.arc(this.xProject, this.yProject, DOT_RADIUS * this.sizeProjection, 0, Math.PI * 2);
    ctx.fillStyle = '#' + this.color;
    ctx.fill();
    ctx.closePath();
  }
}

function createDots() {
  // Empty the array of dots
  dots.length = 0;
  
  // Create a new dot based on the amount needed
  for (let i = 0; i < DOTS_AMOUNT; i++) {
    const theta = Math.random() * 2 * Math.PI; // Random value between [0, 2PI]
    const phi = Math.acos((Math.random() * 2) - 1); // Random value between [-1, 1]
    
    // Calculate the [x, y, z] coordinates of the dot along the globe
    const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
    const z = (GLOBE_RADIUS * Math.cos(phi)) + GLOBE_CENTER_Z;
    dots.push(new Dot(x, y, z));
  }
}

createDots();

function render(a) {
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  // Increase the globe rotation
  rotation = a * 0.010;
  
  const sineRotation = Math.sin(rotation); // Sine of the rotation
  const cosineRotation = Math.cos(rotation); // Cosine of the rotation

  // Loop through the dots array and project every dot
  for (let i = 0; i < dots.length; i++) {
    dots[i].project(sineRotation, cosineRotation);
  }

  // Sort dots array based on their projected size
  dots.sort((dot1, dot2) => {
    return dot1.sizeProjection - dot2.sizeProjection;
  });
  
  // Loop through the dots array and draw every dot
  for (var i = 0; i < dots.length; i++) {
    dots[i].draw();
  }
}

  device.startRendering(() => {
    // Update & draw
    counter += 1;
    render(counter);
    // Get data
    const ImageData = ctx.getImageData(0, 0, width, height)
    // Send data to LEDs
    device.setRGBABuffer(ImageData.data)

  }, MAX_FPS)
}

const service = new PixelPusher.Service()

service.on('discover', (device) => {
  createRenderer(device)
})
