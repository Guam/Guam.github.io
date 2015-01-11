function Circ() {
  this.x = Math.floor(Math.random() * (640 - 30));;
  this.y = Math.floor(Math.random() * (480 - 30));;
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

Circ.prototype.update = function() {
  if (this.y < 0) {
    this.velocity = 1;
  } else if (this.y > 450) {
    this.velocity = -1;
  }
  
  this.y += this.velocity;
};