var mouseDown = false;
var touches = 0;
var doubleTouch = false;
var doubleClick = false;

function MyFractalPixi() {
  this.offset = {x: -1, y: 0 };
  this.scale = { x: 0.2, y: 0.2 };
  this.dimension = { x: 0, y: 0 };
  this.focusPoint = { x: -0.913, y: 0.27 };
  this.iterations = 150;
  this.uniforms = {};
  this.standardOffset = 0.008;
  this.standardZoom = 0.025;
  this.mousePosition = {};
  this.isJulia = false;
  this.burningShip = false;
  this.oscillate = false;
  this.pause = false;
  this.damping = 4;
  this.bailoutColor = { x: 1.0, y: 1.0, z: 1.0 };
  this.colors = [
    { x: 0.0, y: 0.15, z: 0.1 },
    { x: 0.5, y: 0.1, z: 0.0 },
    { x: 1.0, y: 0.3, z: 0.0 },
    { x: 1.0, y: 1.0, z: 0.0 },
    { x: 1.0, y: 1.0, z: 0.1 }
  ];
  this.stops = [
    0.05,
    0.1,
    0.2,
    0.5,
    1.0
  ];
  this.canUpdateFocusPointOnTouch = true;
  this.touchManager = new TouchManager();

  this.updateFocusPoint = function(position) {
    if(this.canUpdateFocusPointOnTouch) {
      this.focusPoint.x = (position.x - this.dimension.x/2.0) / Math.max(this.dimension.y, this.dimension.x) / this.scale.x + this.offset.x;
      this.focusPoint.y = (position.y - this.dimension.y/2.0) / Math.max(this.dimension.y, this.dimension.x) / this.scale.y + this.offset.y;
    }
  }

  this.initialize = function(containderId) {
    this.container = document.getElementById(containderId);
    this.dimension.x = this.container.clientWidth;
    this.dimension.y = this.container.clientHeight;
    // Chooses either WebGL if supported or falls back to Canvas rendering
    this.renderer = new PIXI.autoDetectRenderer(this.dimension.x, this.dimension.y, { preserveDrawingBuffer:true });
    // Add the render view object into the page
    this.renderer.view.setAttribute('id','fractalPixi')

    this.container.appendChild(this.renderer.view);

    this.initializeUrlParams();

    this.container.onmousedown = function(e) { mouseDown = true; }
    this.container.onmouseup = (function(e) {
      mouseDown = false;
      doubleClick = false;
      if (this.fractal.isJulia){
        // var topButtonRight = document.getElementById("top-button-right");
        // topButtonRight.innerHTML = " (double click to interact)";
      }
      this.fractal.updateUrlParams();
    }).bind({fractal: this, element: this.container});
    this.container.ondblclick = (function(e) {
      doubleClick = !doubleClick;
      var topButtonRight = document.getElementById("top-button-right");
      // if (this.fractal.isJulia) {
      //   if (doubleClick)
      //     topButtonRight.innerHTML = " (interact by draggin)";
      //   else
      //     topButtonRight.innerHTML = " (double click to interact)";
      // }
    }).bind({fractal: this, element: this.container});

    window.onwheel = (function(e) {
      this.fractal.offset.x -= e.wheelDeltaX/(this.fractal.scale.x * this.fractal.dimension.x * this.fractal.damping );
      this.fractal.scale.x *= 1+e.wheelDeltaY/this.fractal.dimension.y;
      this.fractal.scale.y *= 1+e.wheelDeltaY/this.fractal.dimension.y;
      this.fractal.updateUrlParams();
    }).bind({fractal: this, element: this.container});

    this.container.onmousemove = (function(e) {
      if(mouseDown && doubleClick){
        this.fractal.updateFocusPoint(this.fractal.mousePosition);
      }
      else if (mouseDown) {
        this.fractal.offset.x -= e.movementX/(this.fractal.scale.x * this.fractal.dimension.x);
        this.fractal.offset.y -= e.movementY/(this.fractal.scale.x * this.fractal.dimension.y);
        return;
      }
      if(this.fractal.pause) return;
      this.fractal.mousePosition.x = e.pageX - this.element.offsetLeft;
      this.fractal.mousePosition.y = e.pageY - this.element.offsetTop;
      this.fractal.updateUniforms();

      if (!this.fractal.pause && mouseDown) {
        this.fractal.updateFocusPoint(this.fractal.mousePosition);
      }
    }).bind({fractal: this, element: this.container});

    this.container.ontouchstart = (function(e) {
      e.preventDefault();
      touches++;
      if (touches > 1) doubleTouch = true;

      if(e.touches.length == 1) { // Only deal with one finger

        var touch = e.touches[0]; // Get the information for finger #1
        this.fractal.previousTouch = {
          x: touch.pageX,
          y: touch.pageY
        };
        log("one touch");
      }
      else if(e.touches.length == 2) {
        this.fractal.touchManager.setFirstPosition(e.touches);
        log("two touches!");
      }
    }).bind({fractal: this, element: this.container});

    this.container.ontouchmove = (function(e) {
      e.preventDefault();
      if(e.touches.length == 1) {
        var touch = e.touches[0];
        if (this.fractal.isJulia) {
          log("is julia");
          this.fractal.updateFocusPoint({x: touch.pageX, y: touch.pageY})
        }
        else if (!doubleTouch){
          log("isn't julia and no double touch");
          this.fractal.offset.x += ((this.fractal.previousTouch.x - touch.pageX) / this.fractal.dimension.x)/this.fractal.scale.x;
          this.fractal.offset.y += ((this.fractal.previousTouch.y - touch.pageY) / this.fractal.dimension.y)/this.fractal.scale.x;
          this.fractal.previousTouch = {
            x: touch.pageX,
            y: touch.pageY
          };
          this.fractal.updateUniforms();
        }
      }
      if(e.touches.length == 2) {
        var scale = this.fractal.touchManager.update(e.touches).scale();
        var movement =  this.fractal.touchManager.movement();
        log("touch length " + scale);
        this.fractal.scale.x *= scale;
        this.fractal.scale.y *= scale;
        this.fractal.offset.x -= movement.x / this.fractal.dimension.x / this.fractal.scale.x;
        this.fractal.offset.y -= movement.y / this.fractal.dimension.y / this.fractal.scale.y;
        this.fractal.canUpdateFocusPointOnTouch = false;
      }
    }).bind({fractal: this, element: this.container});

    this.container.ontouchend = (function(e) {
      touches--;
      if (touches < 1) {
        doubleTouch = false;
        this.fractal.canUpdateFocusPointOnTouch = true;
      }

      log("touch end!");
      this.fractal.updateUrlParams();
    }).bind({fractal: this, element: this.container});

    var topButton = document.getElementById("top-button");
    topButton.onclick = (function() {
      this.toggleJulia(topButton);
    }).bind(this);

    topButton.onctouch = (function() {
      this.toggleJulia();
    }).bind(this);

    var bottomButton = document.getElementById("bottom-button");
    bottomButton.onclick = (function() {
      this.toggleBurningShip();
    }).bind(this);

    bottomButton.onctouch = (function() {
      this.toggleBurningShip();
      if(this.isJulia)
        bottomButton.innerHTML = "Turn OFF Burning Ship Fractal";
       else
        bottomButton.innerHTML = "Turn ON Burning Ship Fractal";
    }).bind(this);

    this.updateBurningShipText = function() {
      var element = document.getElementById("bottom-button");
      if(this.burningShip)
        element.innerHTML = "Turn OFF Burning Ship Fractal";
      else
        element.innerHTML = "Turn ON Burning Ship Fractal";
    }

    this.updateBurningShipText();
    this.updateJuliaSetText();

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

    this.time = 0;
    this.numColors = this.colors.length;
    this.uniformsManager = new GlslUniforms();
    this.uniformsManager.initialize(
      [
        { name: "time", uniform: {type:"f", value: 0 }},
        { name: "isJulia", uniform: {type:"b", value: this.isJulia }},
        { name: "burningShip", uniform: {type:"b", value: this.burningShip }},
        { name: "oscillate", uniform: {type:"b", value: this.oscillate }},
        { name: "iterations", uniform: {type:"i", value: this.iterations }},
        { name: "dimension", uniform: {type:"v2", value: this.dimension }},
        { name: "scale", uniform: {type:"v2", value: this.scale }},
        { name: "offset", uniform: {type:"v2", value: this.offset }},
        { name: "mousePosition", uniform: {type:"v2", value: this.mousePosition }},
        { name: "focusPoint", uniform: {type:"v2", value: this.focusPoint }},
        { name: "bailoutColor", uniform: {type:"v3", value: this.bailoutColor }},
        { name: "numColors", uniform: {type:"i", value: this.numColors }},
        { name: "colors", uniform: {type:"v3v", value: this.colors }},
        { name: "stops", uniform: {type:"fv1", value: this.stops }}
      ]
    );
    this.uniforms = this
      .uniformsManager
      .getUniforms();


    this.updateUniforms();
    //Get shader code as a string
    var shaderCode = MyShaders.fractalShader;
    //Create our Pixi filter using our custom shader code
    var simpleShader = new PIXI.AbstractFilter('', shaderCode, this.uniforms);
    //Apply it to our object
    this.image.filters = [simpleShader];
    return this;
  }

  this.updateUniforms = function() {
    this.uniforms = this.uniformsManager
      .update(this)
      .getUniforms();
  }

  this.initializeUrlParams = function() {
    var urlString = window.location.href;
    var url = new URL(urlString);
    var params = url.searchParams;
    this.isJulia = (params.get("julia") == "true");
    this.burningShip = (params.get("burning_ship") == "true");
    this.oscillate = (params.get("oscillate") == "true");

    var iterations = Number(params.get("iterations"));
    if(iterations) this.iterations = iterations;
    var scale = Number(params.get("scale"));
    if(scale) this.scale = { x: scale, y: scale };
    this.focusPoint = parseAndGetParamPoint(this.focusPoint, params.get("focus_point"));
    this.offset = parseAndGetParamPoint(this.offset, params.get("offset"));
    this.bailoutColor = parseAndGetColor(this.bailoutColor, params.get("bailout_color"));
    for(var i = 0; i < this.colors.length; i++) {
      this.colors[i] = parseAndGetColor(this.colors[i], params.get("color"+i));
      var stop = Number(params.get("stop"+i));
      if(stop) this.stops[i] = stop;
    }
  }

  this.updateUrlParams = function() {
    var urlString = window.location.href;
    var url = new URL(urlString);
    newUrl = url.origin + url.pathname + "?" +
    "&julia=" + this.isJulia +
    "&burning_ship=" + this.burningShip +
    "&oscillate=" + this.oscillate +
    "&iterations=" + this.iterations +
    "&scale=" + this.scale.x +
    "&focus_point=" + this.focusPoint.x + "," + this.focusPoint.y +
    "&offset=" + this.offset.x + "," + this.offset.y +
    "&bailout_color=" + this.bailoutColor.x + "," + this.bailoutColor.y + "," + this.bailoutColor.z

    colorStopsParams = "";
    for(var i = 0; i < this.colors.length; i++) {
      colorStopsParams +=
        "&color" + i + "=" +
        this.colors[i].x + "," +
        this.colors[i].y + "," +
        this.colors[i].z + "&" +
        "&stop" + i + "=" +
        this.stops[i]
    }
    newUrl += colorStopsParams;

    history.replaceState({}, null, newUrl);
  }

  this.animate = (function () {
    this.time += 0.1;
    this.updateUniforms();
    // start the timer for the next animation loop
    requestAnimationFrame(this.animate);
    // this is the main render call that makes pixi draw your container and its children.
    this.renderer.render(this.stage);
  }).bind(this);

  this.togglePause = function() {
    this.pause = !this.pause;
    this.updateUniforms();
  };

  this.toggleOscillate = function() {
    this.oscillate = !this.oscillate;
    this.updateUniforms();
  };

  this.toggleJulia = function(element) {
    this.isJulia = !this.isJulia;
    this.updateJuliaSetText();
    this.updateUniforms();
  };

  this.updateJuliaSetText = function() {
    var element = document.getElementById("top-button");
    if(this.isJulia) {
      element.innerHTML = "Turn OFF Julia Fractal";
    }
    else {
      element.innerHTML = "Turn ON Julia Fractal";
    }
  }

  this.toggleBurningShip = function() {
    this.burningShip = !this.burningShip;
    this.updateBurningShipText();
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
}

function parseAndGetColor(originalLValue, newValue) {
  if(newValue) {
    var colorArray = newValue.split(",");

    if(colorArray.length == 3) {
      var color = { x: Number(colorArray[0]),
                    y: Number(colorArray[1]),
                    z: Number(colorArray[2]) };
      if(!isNaN(color.x) && !isNaN(color.y) && !isNaN(color.z)) {
        return color;
      }
    }
  }
  return originalLValue;
}

function parseAndGetParamPoint(originalLValue, newValue) {
  if(newValue) {
    var pointArray = newValue.split(",");
    if(pointArray.length == 2) {
      var point = { x: Number(pointArray[0]), y: Number(pointArray[1]) };
      if(!isNaN(point.x) && !isNaN(point.y)) {
        return point;
      }
    }
  }
  return originalLValue;
}
