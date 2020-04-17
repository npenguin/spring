const DIMENTION = 2;
const DELTA_T = 0.3;
const NUM_OF_STEPS = 10000;
const GRAVITY = 1.0;

// setup: canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WALL_LENGTH = [WIDTH, HEIGHT];

function getDistance(pos1, pos2) {
  var distance = 0.0;
  for (let i = 0; i < DIMENTION; ++i) {
    distance += Math.pow(pos1[i] - pos2[i], 2);
  }
  distance = Math.sqrt(distance);
  return distance;
}

function getRandomInt(min, max) {
  var num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function getRandomNum(min, max) {
  var num = Math.random() * (max - min + 1) + min;
  return num;
}

class Ball {
  constructor(pos, vel, size, density, color, is_fixed) {
    this.pos = pos;
    this.vel = vel;
    this.force = Array(DIMENTION);
    this.force.fill(0.0);
    this.size = size;
    this.density = density;
    this.color = color;
    this.mass = (4.0 / 3.0) * Math.pow(this.size, 3) * this.density;
    this.is_fixed = is_fixed;
  }
  calcForce() {
    this.force[1] += GRAVITY * this.mass;
  }
  update() {
    for (let i = 0; i < DIMENTION; ++i) {
      if (!this.is_fixed) {
        this.pos[i] += this.vel[i] * DELTA_T;
        this.vel[i] += this.force[i] / this.mass * DELTA_T;
      }
      this.force[i] = 0.0;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.pos[0], this.pos[1], this.size, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class Spring {
  constructor(ball1, ball2, length, spring_constant, color) {
    this.ball1 = ball1;
    this.ball2 = ball2;
    this.force = Array(DIMENTION);
    this.length = length;
    this.distance = getDistance(this.ball1.pos, this.ball2.pos);
    this.spring_constant = spring_constant;
    this.color = color;
  }
  calcForce() {
    // force < 0: compression
    // force > 0: tensile
    this.distance = getDistance(this.ball1.pos, this.ball2.pos);
    for (let i = 0; i < DIMENTION; ++i) {
      this.force[i] = this.distance - this.length;
      this.force[i] *= (this.ball1.pos[i] - this.ball2.pos[i]) / this.distance;
      this.force[i] *= this.spring_constant;
      this.ball1.force[i] += - this.force[i];
      this.ball2.force[i] +=   this.force[i];
    }
  }
  draw() {
    ctx.beginPath();
    ctx.moveTo(this.ball1.pos[0], this.ball1.pos[1]);
    ctx.lineTo(this.ball2.pos[0], this.ball2.pos[1]);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.spring_constant / 2;
    ctx.stroke();
  }
}

var balls = [];
var springs = [];

var ball1 = new Ball(
  [WIDTH / 2.0, 10.0],
  [0.0, 0.0],
  10.0,
  0.5,
  "rgb(" + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ")",
  true
)

var ball2 = new Ball(
  [WIDTH / 2.0, HEIGHT / 2.0],
  [0.0, 0.0],
  10.0,
  0.5,
  "rgb(" + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ", " + getRandomInt(0, 255) + ")",
  false
)

var spring = new Spring(
  ball1,
  ball2,
  getDistance(ball1.pos, ball2.pos),
  10.0,
  "rgb(0, 0, 0)"
)

balls.push(ball1);
balls.push(ball2);
springs.push(spring);

var start = null;

function loop(timestamp) {
  if(!start) start = timestamp;
  var elapsed_steps = timestamp - start;
  if (elapsed_steps > NUM_OF_STEPS) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < springs.length; ++i) {
    console.log("spring (" + i + "): " + springs[i].distance);
    springs[i].draw();
    springs[i].calcForce();
  }
  for (let i = 0; i < balls.length; ++i) {
    balls[i].draw();
    balls[i].calcForce();
    balls[i].update();
  }
    requestAnimationFrame(loop);
}

document.getElementById("start_button").onclick = function() {
  requestAnimationFrame(loop);
}