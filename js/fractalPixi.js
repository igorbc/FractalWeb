function MyFractalPixi(){
  this.offset = {x: -1, y: 0 };
  this.scale = { x: 0.2, y: 0.2 };
  this.dimension = { x: 0, y: 0 };
  this.iterations = 100;
  this.uniforms = {};
  this.standardOffset = 0.008;
  this.standardZoom = 0.025;
  this.mousePosition = {};
  this.isJulia = false;
  this.burningShip = false;
  this.oscillate = false;
  this.pause = false;
  this.doubleTouches = {
    previousTouch1: {},
    previousTouch2: {},
    touch1: {},
    touch2: {},
    setFirstPosition: function(touches){
      this.touch1 = {
        x: touches[0].pageX,
        y: touches[0].pageY
      },
      this.touch2 = {
        x: touches[1].pageX,
        y: touches[1].pageY
      }
      log("first x: " + this.touch1.x);
      return this;
    },
    update: function(touches){
      log("previous distance1: " + this.previousDistance());
      log("current distance: " + this.currentDistance());
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
      log("previous distance2: " + this.previousDistance());
      return this;
    },
    distance: function(t1, t2){
      return Math.sqrt((t1.x - t2.x)*(t1.x - t2.x) + (t1.y - t2.y)*(t1.y - t2.y));
    },
    previousDistance: function(){
      return this.distance(this.previousTouch1, this.previousTouch2);
    },
    currentDistance: function(){
      log("t1.x " + this.touch1.x + " - t2.x: " + this.touch2.x);
      return this.distance(this.touch1, this.touch2);
    },
    scale: function(){
      log(this.currentDistance() + " / " + this.previousDistance());
      return this.currentDistance()/this.previousDistance();
    }
  }

  this.initialize = function(containderId){
    this.container = document.getElementById(containderId);
    this.dimension.x = this.container.clientWidth;
    this.dimension.y = this.container.clientHeight;
    // Chooses either WebGL if supported or falls back to Canvas rendering
    this.renderer = new PIXI.autoDetectRenderer(this.dimension.x, this.dimension.y);
    // Add the render view object into the page
    this.renderer.view.setAttribute('id','fractalPixi')

    this.container.appendChild(this.renderer.view);
    this.container.onmousemove = (function(e) {
      if (this.fractal.pause) return;
      this.fractal.mousePosition.x = e.pageX - this.element.offsetLeft;
      this.fractal.mousePosition.y = e.pageY - this.element.offsetTop;
      this.fractal.updateUniforms();
    }).bind({fractal: this, element: this.container});

    this.container.ontouchstart = (function(e) {
      e.preventDefault();
      if(e.touches.length == 1){ // Only deal with one finger

        var touch = e.touches[0]; // Get the information for finger #1
        this.fractal.previousTouch = {
          x: touch.pageX,
          y: touch.pageY
        };
        log("one touch");
      }
      else if(e.touches.length == 2){
        this.fractal.doubleTouches.setFirstPosition(e.touches);
        log("two touches!");
      }
    }).bind({fractal: this, element: this.container});

    this.container.ontouchmove = (function(e) {
      e.preventDefault();
      if(e.touches.length == 1){ // Only deal with one finger
        var touch = e.touches[0]; // Get the information for finger #1
        // var node = touch.target; // Find the node the drag started from
        diff = {
          x: this.fractal.previousTouch.x - touch.pageX,
          y: this.fractal.previousTouch.y - touch.pageY
        }
        this.fractal.offset.x += ((this.fractal.previousTouch.x - touch.pageX) / this.fractal.dimension.x)/this.fractal.scale.x;
        this.fractal.offset.y += ((this.fractal.previousTouch.y - touch.pageY) / this.fractal.dimension.y)/this.fractal.scale.x;
        this.fractal.previousTouch = {
          x: touch.pageX,
          y: touch.pageY
        };
      }
      if(e.touches.length == 2) {
        var scale = this.fractal.doubleTouches.update(e.touches).scale();
        log("touch lenght " + scale);
        this.fractal.scale.x *= scale;
        this.fractal.scale.y *= scale;
      }
    }).bind({fractal: this, element: this.container});

    this.container.ontouchend = (function(e) {
      log("touch end!");
    }).bind({fractal: this, element: this.container});

    // The stage is the root container that will hold everything in our scene
    this.stage = new PIXI.Container();

    // Load an image and create an object
    this.image = new PIXI.Sprite();
    this.image.width = this.dimension.x;
    this.image.height = this.dimension.y;
    // Set it at the center of the screen
    this.image.x = this.dimension.x / 2;
    this.image.y = this.dimension.y / 2;
    // Make sure the center point of the image is at its center, instead of the default top left
    this.image.anchor.set(0.5);
    // Add it to the screen
    this.stage.addChild(this.image);


    this.uniforms.time = { type:"f", value: 0};
    this.uniforms.isJulia = {type:"b", value: this.isJulia };
    this.uniforms.burningShip = { type:"b", value: this.burningShip };
    this.uniforms.oscillate = { type:"b", value: this.oscillate };
    this.updateUniforms();
    //Get shader code as a string
    var shaderCode = MyShaders.fractalShader;
    //Create our Pixi filter using our custom shader code
    var simpleShader = new PIXI.AbstractFilter('', shaderCode, this.uniforms);
    //Apply it to our object
    this.image.filters = [simpleShader];
    return this;
  }

  this.togglePause = function() {
    this.pause = !this.pause;
    this.updateUniforms();
  };

  this.toggleOscillate = function() {
    this.oscillate = !this.oscillate;
    this.updateUniforms();
  };

  this.toggleJulia = function() {
    this.isJulia = !this.isJulia;
    this.updateUniforms();
  };

  this.toggleBurningShip = function() {
    this.burningShip = !this.burningShip;
    this.updateUniforms();
  };

  this.incrementOffsetX = function(v = this.standardOffset) {
    this.offset.x += v / this.scale.x;
    this.updateUniforms();
  };

  this.incrementOffsetY = function(v = this.standardOffset) {
    this.offset.y -= v / this.scale.y;
    this.updateUniforms();
  };

  this.decrementOffsetX = function(v = this.standardOffset) {
    this.offset.x -= v / this.scale.x;
    this.updateUniforms();
  };

  this.decrementOffsetY = function(v = this.standardOffset) {
    this.offset.y += v / this.scale.y;
    this.updateUniforms();
  };

  this.zoomIn = function(v = this.standardZoom) {
    this.scale.x *= 1+v;
    this.scale.y *= 1+v;
  }

  this.zoomOut = function(v = this.standardZoom) {
    this.scale.x *= 1-v;
    this.scale.y *= 1-v;
  }

  this.updateUniforms = function() {
    // this.uniforms.isJulia = { type:"b", value: this.isJulia };
    this.uniforms.isJulia.value = this.isJulia;
    this.uniforms.burningShip.value = this.burningShip;
    this.uniforms.oscillate.value = this.oscillate;
    this.uniforms.iterations = { type:"i", value: this.iterations };
    this.uniforms.dimension = { type:"v2", value: this.dimension };
    this.uniforms.scale = { type:"v2", value: this.scale };
    this.uniforms.offset = { type:"v2", value: this.offset };
    this.uniforms.mousePosition = { type:"v2", value: this.mousePosition };
  }

  this.animate = (function () {
    this.uniforms.time.value += 0.1;
    this.updateUniforms();
    // start the timer for the next animation loop
    requestAnimationFrame(this.animate);
    // this is the main render call that makes pixi draw your container and its children.
    this.renderer.render(this.stage);
  }).bind(this);
}

function log(message){
  return;
  document.getElementById("debug-info").innerHTML = message + '<br>' + document.getElementById("debug-info").innerHTML;
}

function startFractalPixi() {
  window.myFractal = new MyFractalPixi();

  myFractal
    .initialize("fractalContainer")
    .animate();

  setupKeyHandlerPixi();
}
