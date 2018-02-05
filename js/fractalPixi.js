function MyFractalPixi(){
  this.offset = {x: 0.0, y: 0.0 };
  this.scale = { x: 3.5, y: 3.5 };
  this.dimension = { x: 1000, y: 1000 };
  this.iterations = 200;
  this.uniforms = {};
  this.standardOffset = 0.015;
  this.standardZoom = 0.025;
  this.mousePosition = {};
  this.isJulia = false;
  this.burningShip = false;

  this.toggleJulia = function() {
    this.isJulia = !this.isJulia;
    this.updateUniforms();
  };

  this.incrementOffsetX = function(v = this.standardOffset) {
    this.offset.x += v * this.scale.x;
    this.updateUniforms();
  };

  this.incrementOffsetY = function(v = this.standardOffset) {
    this.offset.y -= v * this.scale.y;
    this.updateUniforms();
  };

  this.decrementOffsetX = function(v = this.standardOffset) {
    this.offset.x -= v * this.scale.x;
    this.updateUniforms();
  };

  this.decrementOffsetY = function(v = this.standardOffset) {
    this.offset.y += v * this.scale.y;
    this.updateUniforms();
  };

  this.zoomIn = function(v = this.standardZoom) {
    this.scale.x *= 1-v;
    this.scale.y *= 1-v;
  }

  this.zoomOut = function(v = this.standardZoom) {
    this.scale.x *= 1+v;
    this.scale.y *= 1+v;
  }

  this.initialize = function(containderId){
    this.dimension.x = window.innerWidth;
    this.dimension.y = window.innerHeight;
    // Chooses either WebGL if supported or falls back to Canvas rendering
    this.renderer = new PIXI.autoDetectRenderer(this.dimension.x, this.dimension.y);
    // Add the render view object into the page
    this.renderer.view.setAttribute('id','fractalPixi')

    this.container = document.getElementById(containderId);
    this.container.appendChild(this.renderer.view);
    this.container.onmousemove = (function(e) {
      this.fractal.mousePosition.x = e.pageX - this.element.offsetLeft;
      this.fractal.mousePosition.y = e.pageY - this.element.offsetTop;
      this.fractal.updateUniforms();
    }).bind({fractal: this, element: this.container})

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


    this.uniforms.time = { type:"f", value: 0}
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
    // this.uniforms.isJulia = { type:"b", value: this.isJulia };
    this.uniforms.isJulia = {type:"b", value: this.isJulia };
    this.uniforms.burningShip = { type:"b", value: this.burningShip };
    this.uniforms.iterations = { type:"i", value: this.iterations };
    this.uniforms.dimension = { type:"v2", value: this.dimension };
    this.uniforms.scale = { type:"v2", value: this.scale };
    this.uniforms.offset = { type:"v2", value: this.offset };
    this.uniforms.mousePosition = { type:"v2", value: this.mousePosition };
  }

  this.animate = (function () {
    this.uniforms.time.value += 0.1;
    // start the timer for the next animation loop
    requestAnimationFrame(this.animate);
    // this is the main render call that makes pixi draw your container and its children.
    this.renderer.render(this.stage);
  }).bind(this);
}

function startFractalPixi() {
  window.myFractal = new MyFractalPixi();

  myFractal
    .initialize("fractalContainer")
    .animate();

  setupKeyHandlerPixi();
}
