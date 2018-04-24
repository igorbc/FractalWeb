var mouseDown = false;
var touches = 0;
var doubleTouch = false;
var doubleClick = false;

function MyFractalPixi() {
  this.offset = {x: -1, y: 0 };
  this.scale = 0.2;
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

  this.updateFocusPoint = function(position) {
    if(this.canUpdateFocusPointOnTouch) {
      this.focusPoint.x = (position.x - this.dimension.x/2.0) / Math.max(this.dimension.y, this.dimension.x) / this.scale + this.offset.x;
      this.focusPoint.y = (position.y - this.dimension.y/2.0) / Math.max(this.dimension.y, this.dimension.x) / this.scale + this.offset.y;
    }
  }

  this.setupUrlParamManager = function() {
    this.urlParamManager = new URLParamManager();
    this.urlParamManager.initialize(this, [
      { varName: "burningShip", paramName: "burning_ship", type: "bool" },
      { varName: "oscillate", paramName: "oscillate", type: "bool" },
      { varName: "iterations", paramName: "iterations", type: "int" },
      { varName: "scale", paramName: "scale", type: "float" },
      { varName: "focusPoint", paramName: "focus_point", type: "vec2" },
      { varName: "offset", paramName: "offset", type: "vec2" },
      { varName: "bailoutColor", paramName: "bailout_color", type: "vec3" },
      { varName: "isJulia", paramName: "julia", type: "bool" },
      { varName: "stops", paramName: "stops", type: "aint" },
      { varName: "colors", paramName: "colors", type: "avec3" }
    ])
    this.urlParamManager.loadUrlParams();

    return this;
  }

  this.initialize = function(containderId, canvasId) {
    this.container = document.getElementById(containderId);
    this.dimension.x = this.container.clientWidth;
    this.dimension.y = this.container.clientHeight;
    // Chooses either WebGL if supported or falls back to Canvas rendering
    this.renderer = new PIXI.autoDetectRenderer(this.dimension.x, this.dimension.y, { preserveDrawingBuffer:true });
    // Add the render view object into the page
    this.renderer.view.setAttribute('id', canvasId);

    this.container.appendChild(this.renderer.view);

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
        { name: "scale", uniform: {type:"f", value: this.scale }},
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

  this.setupMouseInteraction = function() {
    this.container.onmousedown = function(e) { mouseDown = true; }

    this.container.onmouseup = (function(e) {
      mouseDown = false;
      doubleClick = false;
      if (this.fractal.isJulia){
        // var topButtonRight = document.getElementById("top-button-right");
        // topButtonRight.innerHTML = " (double click to interact)";
      }
      if(this.fractal.urlParamManager)
        this.fractal.urlParamManager.updateUrlParams();
    }).bind({fractal: this, element: this.container});

    this.container.ondblclick = (function(e) {
      doubleClick = !doubleClick;
    }).bind({fractal: this, element: this.container});

    this.container.onmousemove = (function(e) {
      if(mouseDown && doubleClick){
        this.fractal.updateFocusPoint(this.fractal.mousePosition);
      }
      else if (mouseDown) {
        this.fractal.offset.x -= e.movementX/(this.fractal.scale * this.fractal.dimension.x);
        this.fractal.offset.y -= e.movementY/(this.fractal.scale * this.fractal.dimension.y);
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

    window.onwheel = (function(e) {
      this.fractal.offset.x -= e.wheelDeltaX/(this.fractal.scale * this.fractal.dimension.x * this.fractal.damping );
      this.fractal.scale *= 1+e.wheelDeltaY/this.fractal.dimension.y;
      if(this.fractal.urlParamManager)
        this.fractal.urlParamManager.updateUrlParams();
    }).bind({fractal: this, element: this.container});

    return this;
  }

  this.setupTouchInteraction = function(juliaElementId, burningShipElementId) {
    this.touchManager = new TouchManager();
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
          this.fractal.offset.x += ((this.fractal.previousTouch.x - touch.pageX) / this.fractal.dimension.x)/this.fractal.scale;
          this.fractal.offset.y += ((this.fractal.previousTouch.y - touch.pageY) / this.fractal.dimension.y)/this.fractal.scale;
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
        this.fractal.scale *= scale;
        this.fractal.offset.x -= movement.x / this.fractal.dimension.x / this.fractal.scale;
        this.fractal.offset.y -= movement.y / this.fractal.dimension.y / this.fractal.scale;
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
      if(this.fractal.urlParamManager)
        this.fractal.urlParamManager.updateUrlParams();
    }).bind({fractal: this, element: this.container});

    var burningShipElement = document.getElementById(burningShipElementId);
    burningShipElement.onctouch = (function() {
      this.toggleBurningShip();
      this.updateBurningShipText(burningShipElement);
      if(this.isJulia)
      burningShipElement.innerHTML = "Turn OFF Burning Ship Fractal";
      else
      burningShipElement.innerHTML = "Turn ON Burning Ship Fractal";
    }).bind(this);

    var juliaElement = document.getElementById(juliaElementId);
    juliaElement.onctouch = (function() {
      this.toggleJulia();
      this.updateJuliaSetText(juliaElement);
    }).bind(this);

    return this;
  }

  this.setupUi = function(juliaElementId, burningShipElementId) {
    var juliaElement = document.getElementById(juliaElementId);
    juliaElement.onclick = (function() {
      this.toggleJulia();
      this.updateJuliaSetText(juliaElement);
    }).bind(this);

    var burningShipElement = document.getElementById(burningShipElementId);
    burningShipElement.onclick = (function() {
      this.toggleBurningShip();
      this.updateBurningShipText(burningShipElement);
    }).bind(this);

    this.updateBurningShipText = function(element) {
      if(this.burningShip)
        element.innerHTML = "Turn OFF Burning Ship Fractal";
      else
        element.innerHTML = "Turn ON Burning Ship Fractal";
    }

    this.updateBurningShipText(burningShipElement);
    this.updateJuliaSetText(juliaElement);

    return this;
  }

  this.updateUniforms = function() {
    this.uniforms = this.uniformsManager
      .update(this)
      .getUniforms();
  }

  this.lastRender = 0;
  this.animate = (function (timestamp) {
    // console.log("------");
    // console.log(timestamp);
    // console.log(this.lastRender);
    this.time += (timestamp - this.lastRender)/100;
    // console.log(this.time);
    this.updateUniforms();
    // start the timer for the next animation loop
    requestAnimationFrame(this.animate);
    // this is the main render call that makes pixi draw your container and its children.
    this.renderer.render(this.stage);
    this.lastRender = timestamp;
  }).bind(this);

  this.startAnimation = function() {
    this.lastRender = 0;
    this.time = 0;
    requestAnimationFrame(this.animate);
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

  this.updateJuliaSetText = function(element) {
    if(this.isJulia) {
      element.innerHTML = "Turn OFF Julia Fractal";
    }
    else {
      element.innerHTML = "Turn ON Julia Fractal";
    }
  }

  this.toggleBurningShip = function() {
    this.burningShip = !this.burningShip;
    this.updateUniforms();
  };

  this.incrementOffsetX = function(v = this.standardOffset) {
    this.offset.x += v / this.scale;
    this.updateUniforms();
  };

  this.incrementOffsetY = function(v = this.standardOffset) {
    this.offset.y -= v / this.scale;
    this.updateUniforms();
  };

  this.decrementOffsetX = function(v = this.standardOffset) {
    this.offset.x -= v / this.scale;
    this.updateUniforms();
  };

  this.decrementOffsetY = function(v = this.standardOffset) {
    this.offset.y += v / this.scale;
    this.updateUniforms();
  };

  this.zoomIn = function(v = this.standardZoom) {
    this.scale *= 1+v;
    this.scale *= 1+v;
  }

  this.zoomOut = function(v = this.standardZoom) {
    this.scale *= 1-v;
    this.scale *= 1-v;
  }
}
