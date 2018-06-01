var mouseDown = false;
var touches = 0;
var doubleTouch = false;
var doubleClick = false;
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

function FractalPixi() {
  let previousTouch;
  let urlParamManager;
  let touchManager;
  let standardOffset = 0.1;
  let dimension = { x: 0, y: 0 };
  let focusPointLocked = true;
  let showFocusPoint = false;
  let params = {
    burningShip: false,
    oscillate: false,
    iterations: 150,
    scale: 0.2,
    focusPoint: { x: -0.913, y: 0.27 },
    offset: { x: 0, y: 0 },
    bailoutColor: { x: 1.0, y: 1.0, z: 1.0 },
    isJulia: false,
    stops: [
      0.05,
      0.1,
      0.2,
      0.5,
      1.0
    ],
    colors: [
      { x: 0.0, y: 0.25, z: 0.15 },
      { x: 0.5, y: 0.0, z: 0.0 },
      { x: 1.0, y: 0.0, z: 0.0 },
      { x: 1.0, y: 1.0, z: 0.15 },
      { x: 1.0, y: 1.0, z: 0.1 }
    ]
  };
  let standardZoom = 0.025;
  let mousePosition = {};
  let damping = 4;
  let container;
  let renderer;
  let stage;
  let image;
  let time;
  let numColors;
  let uniformsManager;
  let uniforms;
  let altFractal;
  let focusPointUpdateCallback;
  let changeTypeCallback;
  let focusPointLockedCallback;

  function updateUniforms() {
    uniforms = uniformsManager
      .update({
        time: time,
        isJulia: params.isJulia,
        showFocusPoint: showFocusPoint,
        burningShip: params.burningShip,
        oscillate: params.oscillate,
        iterations: params.iterations,
        dimension: dimension,
        scale: params.scale,
        offset: params.offset,
        mousePosition: mousePosition,
        focusPoint: params.focusPoint,
        bailoutColor: params.bailoutColor,
        numColors: numColors,
        colors: params.colors,
        stops: params.stops
      })
      .getUniforms();
  }

  let fractalPixi = {
    initialize: function(containderId, canvasId, useScreenSize = false) {
      if(typeof(containderId) !== "string" || typeof(canvasId) !== "string")
        throw new Error("container id and canvas id must be provided");
      container = document.getElementById(containderId);
      if(useScreenSize) {
        dimension.x = screen.width * 3;
        dimension.y = screen.height * 3;
      }
      else {
        dimension.x = container.clientWidth;
        dimension.y = container.clientHeight;
      }

      // Chooses either WebGL if supported or falls back to Canvas rendering
      renderer = new PIXI.autoDetectRenderer(dimension.x, dimension.y, { preserveDrawingBuffer:true });
      // Add the render view object into the page
      renderer.view.setAttribute('id', canvasId);

      container.appendChild(renderer.view);

      // The stage is the root container that will hold everything in our scene
      stage = new PIXI.Container();

      // Load an image and create an object
      image = new PIXI.Sprite();
      image.width = dimension.x;
      image.height = dimension.y;
      // Set it at the center of the screen
      image.x = dimension.x / 2;
      image.y = dimension.y / 2;
      // Make sure the center point of the image is at its center, instead of the default top left
      image.anchor.set(0.5);
      // Add it to the screen
      stage.addChild(image);

      time = 0;
      numColors = params.colors.length;
      uniformsManager = new GlslUniforms();
      uniformsManager.initialize(
        [
          { name: "time", uniform: {type:"f", value: 0 }},
          { name: "isJulia", uniform: {type:"b", value: params.isJulia }},
          { name: "showFocusPoint", uniform: {type:"b", value: showFocusPoint }},
          { name: "burningShip", uniform: {type:"b", value: params.burningShip }},
          { name: "oscillate", uniform: {type:"b", value: params.oscillate }},
          { name: "iterations", uniform: {type:"i", value: params.iterations }},
          { name: "dimension", uniform: {type:"v2", value: dimension }},
          { name: "scale", uniform: {type:"f", value: params.scale }},
          { name: "offset", uniform: {type:"v2", value: params.offset }},
          { name: "mousePosition", uniform: {type:"v2", value: mousePosition }},
          { name: "focusPoint", uniform: {type:"v2", value: params.focusPoint }},
          { name: "bailoutColor", uniform: {type:"v3", value: params.bailoutColor }},
          { name: "numColors", uniform: {type:"i", value: numColors }},
          { name: "colors", uniform: {type:"v3v", value: params.colors }},
          { name: "stops", uniform: {type:"fv1", value: params.stops }}
        ]
      );
      uniforms = uniformsManager.getUniforms();

      updateUniforms();
      //Get shader code as a string
      var shaderCode = MyShaders.fractalShader;
      //Create our Pixi filter using our custom shader code
      var simpleShader = new PIXI.AbstractFilter('', shaderCode, uniforms);
      //Apply it to our object
      image.filters = [simpleShader];

      return this;
    },

    getUniforms: function(){
      return uniforms;
    },

    getParams: function(){
      return params;
    },

    setupUrlParamManager: function() {
      urlParamManager = new URLParamManager();
      urlParamManager.initialize(params, [
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
      urlParamManager.loadUrlParams();
      updateUniforms();
      return this;
    },

    setUpdateCallback: function(fractal) {
      altFractal = fractal;
      // if(altFractal) {
      //   altFractal.container.onclick = function() {
      //     console.log("tocou no troço");
      //   }
      // }

      focusPointUpdateCallback = function(){
        altFractal.setFocusPoint(params.focusPoint);
      }

      changeTypeCallback = function() {
        if(params.isJulia && params.burningShip) {
          altFractal.setJulia(false);
          altFractal.setBurningShip(true);
          altFractal.setOffset({ x: -0.5, y: -0.5 });
        }
        else if(params.isJulia && !params.burningShip) {
          altFractal.setJulia(false);
          altFractal.setBurningShip(false);
          altFractal.setOffset({ x: -0.5, y: 0 });
        }
        else if(!params.isJulia && params.burningShip) {
          altFractal.setJulia(true);
          altFractal.setBurningShip(true);
          altFractal.setOffset({ x: 0, y: 0 });
        }
        else if(!params.isJulia && !params.burningShip) {
          altFractal.setJulia(true);
          altFractal.setBurningShip(false);
          altFractal.setOffset({ x: 0, y: 0 });
        }
      }

      focusPointLockedCallback = function() {
        altFractal.setVisibility(!focusPointLocked);
      }

      focusPointUpdateCallback();
      changeTypeCallback();
      focusPointLockedCallback();

      return this;
    },

    setOffset: function(offset) {
      params.offset.x = offset.x;
      params.offset.y = offset.y;
    },

    setFocusPoint: function(focusPoint) {
      params.focusPoint.x = focusPoint.x;
      params.focusPoint.y = focusPoint.y;
    },

    setBurningShip: function(value) {
      params.burningShip = value;
    },

    setVisibility: function(value) {
      if(value)
        container.classList.remove("hidden");
      else
        container.classList.add("hidden");
    },

    setupMouseInteraction: function() {
      container.onmousedown = function(e) { mouseDown = true; }

      container.onmousemove = (function(e) {
        mousePosition.x = e.pageX - this.element.offsetLeft;
        mousePosition.y = e.pageY - this.element.offsetTop;
        if(mouseDown && !focusPointLocked) {
          updateFocusPoint(mousePosition);
        }
        else if (mouseDown) {
          params.offset.x -= e.movementX/(params.scale * dimension.x);
          params.offset.y -= e.movementY/(params.scale * dimension.y);
        }
        updateUniforms();
      }).bind({fractal: this, element: container});

      container.onmouseup = (function(e) {
        mouseDown = false;
        doubleClick = false;

        if(urlParamManager)
          urlParamManager.updateUrlParams();

      }).bind({fractal: this, element: container});

      window.onwheel = (function(e) {
        params.offset.x -= e.wheelDeltaX/(params.scale * dimension.x * damping );
        params.scale *= 1+e.wheelDeltaY/dimension.y;
        if(urlParamManager)
          urlParamManager.updateUrlParams();
      }).bind({fractal: this, element: container});

      return this;
    },

    setupTouchInteraction: function(juliaIds, burningShipIds, focusPointLockIds, oscillateIds) {
      touchManager = new TouchManager();
      container.ontouchstart = (function(e) {
        e.preventDefault();
        touches++;
        if (touches > 1) doubleTouch = true;

        if(e.touches.length == 1) { // Only deal with one finger

          var touch = e.touches[0]; // Get the information for finger #1
          previousTouch = {
            x: touch.pageX,
            y: touch.pageY
          };
          // log("one touch");
        }
        else if(e.touches.length == 2) {
          touchManager.setFirstPosition(e.touches);
          // log("two touches!");
        }
      }).bind({fractal: this, element: container});

      container.ontouchmove = (function(e) {
        e.preventDefault();
        if(e.touches.length == 1) {

          var touch = e.touches[0];
          if(!focusPointLocked) {
            // TODO: remove dependency with view (the 10% height adjustment)
            updateFocusPoint({x: touch.clientX, y: touch.clientY - screen.height * .10})
          }
          if ((!doubleTouch && !params.isJulia && focusPointLocked) ||
            (focusPointLocked && params.isJulia && !doubleTouch)) {
            // log("isn't julia and no double touch");
            params.offset.x += ((previousTouch.x - touch.pageX) / dimension.x)/params.scale;
            params.offset.y += ((previousTouch.y - touch.pageY) / dimension.y)/params.scale;
            previousTouch = {
              x: touch.pageX,
              y: touch.pageY
            };
            updateUniforms();
          }
        }
        if(e.touches.length == 2) {
          var scale = touchManager.update(e.touches).scale();
          var movement =  touchManager.movement();
          // log("touch length " + scale);
          params.scale *= scale;
          params.offset.x -= movement.x / dimension.x / params.scale;
          params.offset.y -= movement.y / dimension.y / params.scale;
        }
      }).bind({fractal: this, element: container});

      container.ontouchend = (function(e) {
        touches--;
        if (touches < 1) {
          doubleTouch = false;
        }
        if (touches == 1) {
          // fractal.touchManager.setFirstPosition(e.touches);
        }
        // log("touch end!");
        if(urlParamManager)
          urlParamManager.updateUrlParams();
      }).bind({fractal: this, element: container});

      var burningShipButton = document.getElementById(burningShipIds + "-button");
      burningShipButton.onctouch = (function() {
        toggleBurningShip();
        updateBurningShipUi(burningShipIds);
      }).bind(this);

      var juliaButton = document.getElementById(juliaIds + "-button");
      juliaButton.onctouch = (function() {
        toggleJulia();
        updateJuliaSetUi(juliaIds);
      }).bind(this);

      var lockButton = document.getElementById(focusPointLockIds + "-button");
      lockButton.onctouch = (function() {
        toggleFocusPointLock();
        updateFocusPointLockUi(focusPointLockIds);
      }).bind(this);

      var oscillateButton = document.getElementById(oscillateIds + "-button");
      lockButton.onctouch = (function() {
        toggleOscillate();
        updateOscillateUi(oscillateIds);
      }).bind(this);

      return this;
    },

    setupUi: function(juliaIds, burningShipIds, focusPointLockIds, oscillateIds) {
      var juliaButton = document.getElementById(juliaIds + "-button");
      juliaButton.onclick = (function() {
        this.toggleJulia();
        updateJuliaSetUi(juliaIds);
      }).bind(this);
      juliaButton.ontouchstart = (function() {
        this.toggleJulia();
        updateJuliaSetUi(juliaIds);
      }).bind(this);

      var burningShipButton = document.getElementById(burningShipIds + "-button");
      burningShipButton.onclick = (function() {
        this.toggleBurningShip();
        updateBurningShipUi(burningShipIds);
      }).bind(this);
      burningShipButton.ontouchstart = (function() {
        this.toggleBurningShip();
        updateBurningShipUi(burningShipIds);
      }).bind(this);

      var focusPointLockButton = document.getElementById(focusPointLockIds + "-button");
      focusPointLockButton.onclick = (function() {
        this.toggleFocusPointLock();
        updateFocusPointLockUi(focusPointLockIds);
      }).bind(this);
      focusPointLockButton.ontouchstart = (function() {
        this.toggleFocusPointLock();
        updateFocusPointLockUi(focusPointLockIds);
      }).bind(this);

      var oscillateButton = document.getElementById(oscillateIds + "-button");
      oscillateButton.onclick = (function() {
        this.toggleOscillate();
        updateOscillateUi(oscillateIds);
      }).bind(this);
      oscillateButton.ontouchstart = (function() {
        this.toggleOscillate();
        updateOscillateUi(oscillateIds);
      }).bind(this);

      updateBurningShipUi(burningShipIds);
      updateJuliaSetUi(juliaIds);
      updateFocusPointLockUi(focusPointLockIds);
      updateOscillateUi(oscillateIds);

      return this;
    },

    startAnimation: function() {
      lastRender = 0;
      time = 0;
      requestAnimationFrame(animate);
    },

    render: function() {
      renderer.render(stage);
    },

    toggleOscillate: function() {
      params.oscillate = !params.oscillate;
      time = 9;
      updateUniforms();
    },

    toggleJulia: function() {
      params.isJulia = !params.isJulia;
      updateUniforms();
      if(altFractal) {
        changeTypeCallback();
      }
    },

    toggleBurningShip: function() {
      params.burningShip = !params.burningShip;
      updateUniforms();
      if(altFractal) {
        changeTypeCallback();
      }
    },

    toggleFocusPointLock: function() {
      focusPointLocked = !focusPointLocked;
      showFocusPoint = !showFocusPoint;
      if(altFractal) {
        focusPointLockedCallback();
      }
    },

    incrementOffsetX: function(v = standardOffset) {
      params.offset.x += v / params.scale;
      updateUniforms();
    },

    incrementOffsetY: function(v = standardOffset) {
      params.offset.y -= v / params.scale;
      updateUniforms();
    },

    decrementOffsetX: function(v = standardOffset) {
      params.offset.x -= v / params.scale;
      updateUniforms();
    },

    decrementOffsetY: function(v = standardOffset) {
      params.offset.y += v / params.scale;
      updateUniforms();
    },

    zoomIn: function(v = standardZoom) {
      params.scale *= 1+v;
      params.scale *= 1+v;
    },

    zoomOut: function(v = standardZoom) {
      params.scale *= 1-v;
      params.scale *= 1-v;
    },

    setJulia: function(value) {
      params.isJulia = value;
    },

    setShowFocusPoint: function(value) {
      showFocusPoint = value;
    },

    applyPreset: function(preset) {
      var p = colorPresets[preset];
      params.colors = p.colors;
      params.stops = p.stops;
      params.bailoutColor = p.bailoutColor;
      updateUniforms();
      return this;
    }
  }

  let lastRender = 0;
  let animate = (function (timestamp) {
    time += (timestamp - lastRender)/100;
    updateUniforms();
    // start the timer for the next animation loop
    requestAnimationFrame(animate);
    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
    lastRender = timestamp;
  }).bind(this);

  function updateBurningShipUi(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(params.burningShip) {
      element.innerHTML = "Burning Ship Fractal is OFF";
      icon.classList.remove("off");
    }
    else {
      element.innerHTML = "Burning Ship Fractal is ON";
      icon.classList.add("off");
    }
  }

  function updateJuliaSetUi(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(params.isJulia) {
      element.innerHTML = "Julia Fractal is ON";
      icon.classList.remove("off");
    }
    else {
      element.innerHTML = "Julia Fractal is OFF";
      icon.classList.add("off");
    }
  }

  function updateFocusPointLockUi(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(focusPointLocked) {
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

  function updateOscillateUi(idPrefix) {
    var element = document.getElementById(idPrefix + "-text");
    var icon = document.getElementById(idPrefix + "-icon");
    if(params.oscillate) {
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

  function updateFocusPoint(position) {
    if(!focusPointLocked) {
      params.focusPoint.x = (position.x - dimension.x/2.0) / Math.max(dimension.y, dimension.x) / params.scale + params.offset.x;
      params.focusPoint.y = (position.y - dimension.y/2.0) / Math.max(dimension.y, dimension.x) / params.scale + params.offset.y;
    }

    if(altFractal) {
      focusPointUpdateCallback();
    }
  }

  return fractalPixi;
}
