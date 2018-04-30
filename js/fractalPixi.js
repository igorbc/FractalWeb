var mouseDown = false;
var touches = 0;
var doubleTouch = false;
var colorPresets = {
  BLACK_WHITE: {
    colors: [
      { x: 1, y: 1, z: 1 },
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 0, y: 0, z: 0 },
    ],
    stops: [
      0.01,
      0.2,
      1
    ],
    bailoutColor: { x: 0, y: 0, z: 0 }
  }
};

function MyFractalPixi() {
  this.offset = { x: 0, y: 0 };
  this.scale = 0.2;
  this.dimension = { x: 0, y: 0 };
  this.focusPoint = { x: -0.913, y: 0.27 };
  this.focusPointLocked = true;
  this.showFocusPoint = false;
  this.iterations = 150;
  this.uniforms = {};
  this.standardOffset = 0.008;
  this.standardZoom = 0.025;
  this.mousePosition = {};
  this.isJulia = false;
  this.burningShip = false;
  this.oscillate = false;
  this.damping = 4;
  this.bailoutColor = { x: 1.0, y: 1.0, z: 1.0 };
  this.colors = [
    { x: 0.0, y: 0.25, z: 0.15 },
    { x: 0.5, y: 0.0, z: 0.0 },
    { x: 1.0, y: 0.0, z: 0.0 },
    { x: 1.0, y: 1.0, z: 0.15 },
    { x: 1.0, y: 1.0, z: 0.1 }
  ];
  this.stops = [
    0.05,
    0.1,
    0.2,
    0.5,
    1.0
  ];

  this.applyPreset = function(preset) {
    var p = colorPresets[preset];
    this.colors = p.colors;
    this.stops = p.stops;
    this.bailoutColor = p.bailoutColor;
    this.updateUniforms();
    return this;
  }

  this.updateFocusPoint = function(position) {
    if(!this.focusPointLocked) {
      this.focusPoint.x = (position.x - this.dimension.x/2.0) / Math.max(this.dimension.y, this.dimension.x) / this.scale + this.offset.x;
      this.focusPoint.y = (position.y - this.dimension.y/2.0) / Math.max(this.dimension.y, this.dimension.x) / this.scale + this.offset.y;
    }

    if(this.altFractal) {
      this.focusPointUpdateCallback();
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

  this.setUpdateCallback = function(fractal) {
    this.altFractal = fractal;
    if(this.altFractal) {
      this.altFractal.container.onclick = function() {
        console.log("tocou no troço");
      }
    }

    this.focusPointUpdateCallback = function(){
      this.altFractal.focusPoint = this.focusPoint;
    }

    this.changeTypeCallback = function() {
      if(this.isJulia && this.burningShip) {
        this.altFractal.isJulia = false;
        this.altFractal.burningShip = true;
        this.altFractal.offset.x = -0.5;
        this.altFractal.offset.y = -0.5;
      }
      else if(this.isJulia && !this.burningShip) {
        this.altFractal.isJulia = false;
        this.altFractal.burningShip = false
        this.altFractal.offset.x = -0.5;
        this.altFractal.offset.y = 0;
      }
      else if(!this.isJulia && this.burningShip) {
        this.altFractal.isJulia = true;
        this.altFractal.burningShip = true;
        this.altFractal.offset.x = 0;
        this.altFractal.offset.y = 0;
      }
      else if(!this.isJulia && !this.burningShip) {
        this.altFractal.isJulia = true;
        this.altFractal.burningShip = false;
        this.altFractal.offset.x = 0;
        this.altFractal.offset.y = 0;
      }
    }

    this.focusPointLockedCallback = function() {
      this.altFractal.setVisibility(!this.focusPointLocked);
    }

    this.focusPointUpdateCallback();
    this.changeTypeCallback();
    this.focusPointLockedCallback();

    return this;
  }

  this.initialize = function(containderId, canvasId, useScreenSize = false) {
    this.container = document.getElementById(containderId);
    if(useScreenSize) {
      this.dimension.x = screen.width * 3;
      this.dimension.y = screen.height * 3;
    }
    else {
      this.dimension.x = this.container.clientWidth;
      this.dimension.y = this.container.clientHeight;
    }

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
        { name: "showFocusPoint", uniform: {type:"b", value: this.showFocusPoint }},
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

  this.setVisibility = function(value) {
    if(value)
      this.container.classList.remove("hidden");
    else
      this.container.classList.add("hidden");
  }

  this.setupMouseInteraction = function() {
    this.container.onmousedown = function(e) { mouseDown = true; }

    this.container.onmousemove = (function(e) {
      this.fractal.mousePosition.x = e.pageX - this.element.offsetLeft;
      this.fractal.mousePosition.y = e.pageY - this.element.offsetTop;
      if(mouseDown && !this.fractal.focusPointLocked) {
        this.fractal.updateFocusPoint(this.fractal.mousePosition);
      }
      else if (mouseDown) {
        this.fractal.offset.x -= e.movementX/(this.fractal.scale * this.fractal.dimension.x);
        this.fractal.offset.y -= e.movementY/(this.fractal.scale * this.fractal.dimension.y);
      }
      this.fractal.updateUniforms();
    }).bind({fractal: this, element: this.container});

    this.container.onmouseup = (function(e) {
      mouseDown = false;
      doubleClick = false;

      if(this.fractal.urlParamManager)
        this.fractal.urlParamManager.updateUrlParams();

    }).bind({fractal: this, element: this.container});

    window.onwheel = (function(e) {
      this.fractal.offset.x -= e.wheelDeltaX/(this.fractal.scale * this.fractal.dimension.x * this.fractal.damping );
      this.fractal.scale *= 1+e.wheelDeltaY/this.fractal.dimension.y;
      if(this.fractal.urlParamManager)
        this.fractal.urlParamManager.updateUrlParams();
    }).bind({fractal: this, element: this.container});

    return this;
  }

  this.setupTouchInteraction = function(juliaIds, burningShipIds, focusPointLockIds, oscillateIds) {
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
        // log("one touch");
      }
      else if(e.touches.length == 2) {
        this.fractal.touchManager.setFirstPosition(e.touches);
        // log("two touches!");
      }
    }).bind({fractal: this, element: this.container});

    this.container.ontouchmove = (function(e) {
      e.preventDefault();
      if(e.touches.length == 1) {

        var touch = e.touches[0];
        if(!this.fractal.focusPointLocked) {
          // TODO: remove dependency with view (the 10% height adjustment)
          this.fractal.updateFocusPoint({x: touch.clientX, y: touch.clientY - screen.height * .10})
        }
        if ((!doubleTouch && !this.fractal.isJulia && this.fractal.focusPointLocked) ||
          (this.fractal.focusPointLocked && this.fractal.isJulia && !doubleTouch)) {
          // log("isn't julia and no double touch");
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
        // log("touch length " + scale);
        this.fractal.scale *= scale;
        this.fractal.offset.x -= movement.x / this.fractal.dimension.x / this.fractal.scale;
        this.fractal.offset.y -= movement.y / this.fractal.dimension.y / this.fractal.scale;
      }
    }).bind({fractal: this, element: this.container});

    this.container.ontouchend = (function(e) {
      touches--;
      if (touches < 1) {
        doubleTouch = false;
      }
      if (touches == 1) {
        // this.fractal.touchManager.setFirstPosition(e.touches);
      }
      // log("touch end!");
      if(this.fractal.urlParamManager)
        this.fractal.urlParamManager.updateUrlParams();
    }).bind({fractal: this, element: this.container});

    var burningShipButton = document.getElementById(burningShipIds + "-button");
    burningShipButton.onctouch = (function() {
      this.toggleBurningShip();
      this.updateBurningShipUi(burningShipIds);
    }).bind(this);

    var juliaButton = document.getElementById(juliaIds + "-button");
    juliaButton.onctouch = (function() {
      this.toggleJulia();
      this.updateJuliaSetUi(juliaIds);
    }).bind(this);

    var lockButton = document.getElementById(focusPointLockIds + "-button");
    lockButton.onctouch = (function() {
      this.toggleFocusPointLock();
      this.updateFocusPointLockUi(focusPointLockIds);
    }).bind(this);

    var oscillateButton = document.getElementById(oscillateIds + "-button");
    lockButton.onctouch = (function() {
      this.toggleOscillate();
      this.updateOscillateUi(oscillateIds);
    }).bind(this);

    return this;
  }

  this.setupUi = function(juliaIds, burningShipIds, focusPointLockIds, oscillateIds) {
    var juliaButton = document.getElementById(juliaIds + "-button");
    juliaButton.onclick = (function() {
      this.toggleJulia();
      this.updateJuliaSetUi(juliaIds);
    }).bind(this);
    juliaButton.ontouchstart = (function() {
      this.toggleJulia();
      this.updateJuliaSetUi(juliaIds);
    }).bind(this);

    var burningShipButton = document.getElementById(burningShipIds + "-button");
    burningShipButton.onclick = (function() {
      this.toggleBurningShip();
      this.updateBurningShipUi(burningShipIds);
    }).bind(this);
    burningShipButton.ontouchstart = (function() {
      this.toggleBurningShip();
      this.updateBurningShipUi(burningShipIds);
    }).bind(this);

    var focusPointLockButton = document.getElementById(focusPointLockIds + "-button");
    focusPointLockButton.onclick = (function() {
      this.toggleFocusPointLock();
      this.updateFocusPointLockUi(focusPointLockIds);
    }).bind(this);
    focusPointLockButton.ontouchstart = (function() {
      this.toggleFocusPointLock();
      this.updateFocusPointLockUi(focusPointLockIds);
    }).bind(this);

    var oscillateButton = document.getElementById(oscillateIds + "-button");
    oscillateButton.onclick = (function() {
      this.toggleOscillate();
      this.updateOscillateUi(oscillateIds);
    }).bind(this);
    oscillateButton.ontouchstart = (function() {
      this.toggleOscillate();
      this.updateOscillateUi(oscillateIds);
    }).bind(this);

    this.updateBurningShipUi(burningShipIds);
    this.updateJuliaSetUi(juliaIds);
    this.updateFocusPointLockUi(focusPointLockIds);
    this.updateOscillateUi(oscillateIds);

    return this;
  }

  this.updateUniforms = function() {
    this.uniforms = this.uniformsManager
      .update(this)
      .getUniforms();
  }

  this.lastRender = 0;
  this.animate = (function (timestamp) {
    this.time += (timestamp - this.lastRender)/100;
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

  this.render = function() {
    this.renderer.render(this.stage);
  }

  this.updateJuliaSetUi = function(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(this.isJulia) {
      element.innerHTML = "Julia Fractal is ON";
      icon.classList.remove("off");
    }
    else {
      element.innerHTML = "Julia Fractal is OFF";
      icon.classList.add("off");
    }
  }

  this.updateBurningShipUi = function(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(this.burningShip) {
      element.innerHTML = "Burning Ship Fractal is OFF";
      icon.classList.remove("off");
    }
    else {
      element.innerHTML = "Burning Ship Fractal is ON";
      icon.classList.add("off");
    }
  }

  this.updateFocusPointLockUi = function(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(this.focusPointLocked) {
      element.innerHTML = "UNLOCK fractal interaction";
      icon.innerHTML = "lock";
      icon.classList.remove("off");
    }
    else {
      element.innerHTML = "LOCK fractal interaction";
      icon.innerHTML = "lock_open";
      icon.classList.add("off");
    }
  }

  this.updateOscillateUi = function(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(this.oscillate) {
      element.innerHTML = "Stop oscillation";
      icon.innerHTML = "all_inclusive";
      icon.classList.remove("off");
    }
    else {
      element.innerHTML = "Start oscillation";
      icon.innerHTML = "all_inclusive";
      icon.classList.add("off");
    }
  }

  this.toggleOscillate = function() {
    this.oscillate = !this.oscillate;
    this.time = 9;
    this.updateUniforms();
  };

  this.toggleJulia = function() {
    this.isJulia = !this.isJulia;
    this.updateUniforms();
    if(this.altFractal) {
      this.changeTypeCallback();
    }
  };

  this.toggleBurningShip = function() {
    this.burningShip = !this.burningShip;
    this.updateUniforms();
    if(this.altFractal) {
      this.changeTypeCallback();
    }
  };

  this.toggleFocusPointLock = function() {
    this.focusPointLocked = !this.focusPointLocked;
    this.showFocusPoint = !this.showFocusPoint;
    if(this.altFractal) {
      this.focusPointLockedCallback();
    }
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
