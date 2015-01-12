var Vec = function(x, y){
    this.type = 'Vector';
    this.x = x;
    this.y = y;
}

Vec.prototype = {
    isub: function(other){
        this.x -= other.x;
        this.y -= other.y;
        return this;
    },
    sub: function(other){
        return new Vec(
            this.x - other.x,
            this.y - other.y
        );
    },
    iadd: function(other){
        this.x += other.x;
        this.y += other.y;
        return this;
    },
    add: function(other){
        return new Vec(
            this.x + other.x,
            this.y + other.y
        );
    },

    imul: function(scalar){
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },
    mul: function(scalar){
        return new Vec(
            this.x * scalar,
            this.y * scalar
        )
    },
    idiv: function(scalar){
        this.x /= scalar;
        this.y /= scalar;
        return this;
    },
    div: function(scalar){
        return new Vec(
            this.x / scalar,
            this.y / scalar
        )
    },

    normalized: function(){
        var x=this.x, y=this.y;
        var length = Math.sqrt(x*x + y*y)
        return new Vec(x/length, y/length);
    },
    normalize: function(){
        var x=this.x, y=this.y;
        var length = Math.sqrt(x*x + y*y)
        this.x = x/length;
        this.y = y/length;
        return this;
    },

    length: function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    },

    distance: function(other){
        var x = this.x - other.x;
        var y = this.y - other.y;
        return Math.sqrt(x*x + y*y);
    },

    copy: function(){
        return new Vec(this.x, this.y);
    }
}

var Simulation = function(id, obj){
    $(document).ready(function(){
        var node = $('#' + id);
        var canvas = node[0];
        var interval, context, last_time;
        if(canvas && canvas.getContext){
            context = canvas.getContext('2d');
            context.fillStyle = 'rgba(40,40,40,1.0)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.dot = function(position, radius){
                var x = position.x, y = position.y;
                if(!radius){
                    radius = 1.0;
                }
                var gradient = context.createRadialGradient(x, y, radius, x, y, radius);
                gradient.addColorStop(0, 'rgba(173,255,42,1.0)');
                gradient.addColorStop(1, 'rgba(173,255,42,0.0)');
                context.fillStyle = gradient;
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI*2, false);
                context.fill();
            };
            context.line = function(a, b){
                context.strokeStyle = 'rgba(173,255,42,0.8)';
                context.lineWidth = 0.5;
                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.stroke();
            };
            obj.init(context);
            node.hover(
                function(){
                    if(!interval){
                        last_time = (new Date().getTime());
                        interval = setInterval(function(){
                            var current_time = (new Date()).getTime();
                            var deltaTime = current_time - last_time;
                            last_time = current_time;
                            obj.step(context, deltaTime);
                        }, 40);
                    }
                },
                function(){
                    if(interval){
                        clearInterval(interval);
                        interval = null;
                    }
                }
            ).click(function(){
                context.fillStyle = 'rgba(40,40,40,1.0)';
                context.fillRect(0, 0, canvas.width, canvas.height);
                obj.init(context);
            });

        }
    });
}

var G = 45.0;
var acceleration = function(a, b){
    var direction = a.sub(b);
    var length = direction.length();
    var normal = direction.normalized();
    return normal.mul(G/Math.pow(length, 2));
};

var copy = function(){
    var result = {}
    for(name in this){
        if(this[name].type == 'Vector'){
            result[name] = this[name].copy();
        }
        else{
            result[name] = this[name];
        }
    }
    return result;
}

var OneBody = function(name, obj){
    obj.body.copy = copy;
    var body = obj.body.copy();
    var center = new Vec(400, 160);

    var simulation = new Simulation(name, {
        init: function(context){
            body = obj.body.copy();
            context.dot(center, 5);
            context.dot(obj.body.position, 1);
        },
        step: function(context,delta){
            var previous = body.copy();
            obj.step(center, body, delta);
            context.line(previous.position, body.position);
        }
    });
};
