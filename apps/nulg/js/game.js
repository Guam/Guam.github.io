var Game = {};

Game.fps = 50;

Game.initialize = function(width,height) {
  this.entities = [];
  this.context = document.getElementById("sim").getContext("2d");
  this.width = width;
  this.height = height;
};

Game.draw = function() {
  this.context.clearRect(0, 0, this.width, this.height);
  
  for (var i=0; i < this.entities.length; i++) {
    this.entities[i].draw(this.context);
  }
};

Game.update = function(dt) {
  for (var i=0; i < this.entities.length; i++) {
    this.entities[i].update(dt);
  }
};

Game.addRect = function() {
  Game.entities.push(new Rect(this.width,this.height));
};

Game.addCirc = function() {
  Game.entities.push(new Circ(this.width,this.height));
};