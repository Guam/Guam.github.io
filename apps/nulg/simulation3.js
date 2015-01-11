var Simulation3 = function(canvas){
    if(canvas.getContext){
        var ctx = canvas.getContext('2d');
        if(ctx){
            this.ready = true;
        }
        else{
            this.ready = false;
            return;
        }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';

    var interval;
    var points = [];
    var constraints = [];
    var gravity = new Vector(0, 2);

    var Constraint = function(point1, point2){
        this.point1 = point1;
        this.point2 = point2;
        this.target = point1.position.distance(point2.position);
        constraints.push(this);
    }

    Constraint.prototype = {
        draw: function(){
            var pos1 = this.point1.position;
            var pos2 = this.point2.position;
            var deviation = this.target - pos1.distance(pos2);
            var color_diff = Math.round(deviation * deviation * 512);
            
            ctx.strokeStyle = 'rgba(' + (128+color_diff) + ', ' + (128-color_diff) + ', ' + (128-color_diff) + ', 1)';

            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
            ctx.stroke();
        },
        resolve: function(){
            var pos1 = this.point1.position;
            var pos2 = this.point2.position;
            var direction = pos2.sub(pos1);
            var length = direction.length();
            var factor = (length-this.target)/(length*2.1);
            var correction = direction.mul(factor);

            this.point1.correct(correction);
            correction.imul(-1);
            this.point2.correct(correction);
        }
    }

    var Point = function(x, y){
        this.position = new Vector(x, y);
        this.previous = new Vector(x, y);
        this.acceleration = new Vector(0, 0);
        points.push(this);
    }

    Point.prototype = {
        accelerate: function(vector){
            this.acceleration.iadd(vector);
        },
        correct: function(vector){
            this.position.iadd(vector);
        },
        simulate: function(delta){
            this.acceleration.imul(delta*delta);
       
            var position = this.position
                .mul(2)
                .sub(this.previous)
                .add(this.acceleration);

            this.previous = this.position;
            this.position = position;
            this.acceleration.zero();
        },
        draw: function(){
            ctx.fillStyle = 'rgba(128, 128, 128, 1)';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 2.5, 0, Math.PI*2, false);
            ctx.fill();
        },
        draw_highlighted: function(){
            ctx.fillStyle = 'rgba(255, 0, 0, 1)';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 2.5, 0, Math.PI*2, false);
            ctx.fill();
        }
    }

    var FixedPoint = function(x, y){
        this.position = new Vector(x, y);
        points.push(this);
    }

    FixedPoint.prototype = {
        accelerate: function(vector){},
        simulate: function(){},
        correct: function(vector){},
        draw: function(){
            ctx.fillStyle = 'rgba(255, 128, 21, 1)';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 2.5, 0, Math.PI*2, false);
            ctx.fill();
        },
        draw_highlighted: function(){
            ctx.fillStyle = 'rgba(255, 0, 0, 1)';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 2.5, 0, Math.PI*2, false);
            ctx.fill();
        }
    }

    var draw = function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        for(var i=0, il=constraints.length; i<il; i++){
            constraints[i].draw();
        }
        for(var i=0, il=points.length; i<il; i++){
            var point = points[i];
            if(point == highlighted){
                point.draw_highlighted();
            }
            else{
                point.draw();
            }
        }
    };

    var simulate = function(){
        var steps = 15;
        var delta = 1/steps;

        for(var j=0; j<steps; j++){
            for(var i=0, il=constraints.length; i<il; i++){
                constraints[i].resolve();
            }

            for(var i=0, il=points.length; i<il; i++){
                var point = points[i];
                point.accelerate(gravity);
                point.simulate(delta);
            }
        }
    };

    this.start = function(){
        if(!interval){
            interval = setInterval(function(){
                simulate();
                draw();
            }, 40);
        }
    };
    this.stop = function(){
        if(interval){
            clearInterval(interval);
            interval = null;
        }
    };
    var minimum_distance = 20*20;
    var highlighted = null;
    this.highlight = function(position){
        highlighted = null;
        for(var i=0; i<points.length; i++){
            var point = points[i];
            var p = point.position;
            var x = p.x - position.x;
            var y = p.y - position.y;

            var distance = x*x + y*y;
            if(distance < minimum_distance){
                highlighted = point;
                break;
            }
        }
    };

    this.remove_highlight = function(){
        if(highlighted){
            var new_constraints = [];
            var new_points = [];
            for(var i=0; i<points.length; i++){
                var point = points[i];
                if(point != highlighted){
                    new_points.push(point);
                }
            }
            for(var i=0; i<constraints.length; i++){
                var constraint = constraints[i];
                if(constraint.point1 != highlighted && constraint.point2 != highlighted){
                    new_constraints.push(constraint);
                }
            }
            constraints = new_constraints;
            points = new_points;
        }
    }

    var make_beam = function(x, y, length, segments){
        var top = new FixedPoint(x, y);
        var bottom = new FixedPoint(x, y+length)
        for(var i=1; i<segments; i++){
            var new_top = new Point(x+i*length, y);
            var new_bottom = new Point(x+i*length, y+length);
            new Constraint(top, new_top);
            new Constraint(bottom, new_bottom);
            new Constraint(new_top, new_bottom);
            new Constraint(top, new_bottom);
            top = new_top;
            bottom = new_bottom;
        }
    }

    make_beam(50, 10, 40, 10);
    draw();
}

var setup3 = function(name){
    var canvas = $('#' + name)
        .attr({
            width: 500,
            height: 200,
        });
    var simulation = new Simulation3(canvas[0]);
    if(simulation.ready){
        $('#reset_' + name).click(function(){
            simulation.stop();
            simulation = new Simulation3(canvas[0]);
        });
        canvas
            .hover(
                function(){
                    simulation.start();
                },
                function(){
                    simulation.stop();
                }
            )
            .click(function(){
                simulation.remove_highlight();
            })
            .mousemove(function(event){
                var offset = $(this).offset();
                var position = new Vector(
                    event.pageX - offset.left,
                    event.pageY - offset.top
                );
                simulation.highlight(position);
            });
    }
}
