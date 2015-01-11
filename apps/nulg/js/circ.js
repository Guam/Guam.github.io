function Circ(w,h) {
  this.x = Math.floor(Math.random() * (w - 30));;
  this.y = Math.floor(Math.random() * (h - 30));;
  this.velocity = Math.random() > 0.5 ? -1 : 1;
};

Circ.prototype.draw = function(context) {
  context.beginPath();
  context.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
  context.fillStyle = '#ff69b4';
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = '#8B0000';
  context.stroke();
};

Circ.prototype.update = function(dt) {
  if (this.y < 0) {
    this.velocity = 1;
  } else if (this.y > 570) {
    this.velocity = -1;
  }
  this.velocity += 0.3*dt;
  this.y += this.velocity*dt;
  console.log('v:'+this.velocity+' y:'+this.y);
};