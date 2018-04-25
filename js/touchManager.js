function TouchManager() {
  this.previousTouch1 = {};
  this.previousTouch2 = {};
  this.touch1 = {};
  this.touch2 = {};
  this.setFirstPosition = function(touches) {
    this.touch1 = {
      x: touches[0].pageX,
      y: touches[0].pageY
    },
    this.touch2 = {
      x: touches[1].pageX,
      y: touches[1].pageY
    }
    // log("first x: " + ffloat(this.touch1.x));
    return this;
  },

  this.update = function(touches) {
    // log("previous distance1: " + ffloat(this.previousDistance()));
    // log("current distance: " + ffloat(this.currentDistance()));
    this.previousTouch1 = this.touch1;
    this.touch1 = {
      x: touches[0].pageX,
      y: touches[0].pageY
    };
    this.previousTouch2 = this.touch2;
    this.touch2 = {
      x: touches[1].pageX,
      y: touches[1].pageY
    }
    // log("previous distance2: " + ffloat(this.previousDistance()));
    return this;
  },

  this.distance = function(t1, t2) {
    return Math.sqrt((t1.x - t2.x)*(t1.x - t2.x) + (t1.y - t2.y)*(t1.y - t2.y));
  },

  this.previousDistance = function() {
    return this.distance(this.previousTouch1, this.previousTouch2);
  },

  this.currentDistance = function() {
    // log("t1.x " + ffloat(this.touch1.x + " - t2.x: " + this.touch2.x));
    return this.distance(this.touch1, this.touch2);
  },

  this.scale = function() {
    // log(ffloat(this.currentDistance()) + " / " + ffloat(this.previousDistance()));
    return this.currentDistance()/this.previousDistance();
  },

  this.movement = function() {
    return {
      x: ((this.touch1.x - this.previousTouch1.x) + (this.touch2.x - this.previousTouch2.x)) / 2,
      y: ((this.touch1.y - this.previousTouch1.y) + (this.touch2.y - this.previousTouch2.y)) / 2,

    }
  }
}

function ffloat(x) {
  return Math.round(x*100)/100;
}
