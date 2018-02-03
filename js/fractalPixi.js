function MyFractalPixi(){
  this.offset = {x: 0.0, y: 0.0 };
  this.scale = { x: 3.5, y: 3.5 };
  this.dimension = { x: 1000, y: 1000 };
  this.iterations = 200;

  this.incrementOffsetX = function(v = 1.0) {
    this.offset.x += v;
  };

  this.incrementOffsetY = function(v = 1.0) {
    this.offset.y += v;
  };

  this.initialize = function(){

  }
}



function startFractalPixi() {

  // Get the  screen width and height
  var width = window.innerWidth;
  var height = window.innerHeight;
  // Chooses either WebGL if supported or falls back to Canvas rendering
  var renderer = new PIXI.autoDetectRenderer(width, height);
  // Add the render view object into the page
  document.body.appendChild(renderer.view);

  // The stage is the root container that will hold everything in our scene
  var stage = new PIXI.Container();

  // Load an image and create an object
  var image = new PIXI.Sprite();
  image.width = width;
  image.height = height;
  // Set it at the center of the screen
  image.x = width / 2;
  image.y = height / 2;
  // Make sure the center point of the image is at its center, instead of the default top left
  image.anchor.set(0.5);
  // Add it to the screen
  stage.addChild(image);

  var uniforms = {}
  uniforms.time = { type:"f", value: 0}
  uniforms.iterations = { type:"i", value: 200}
  uniforms.dimension = { type:"v2", value: { x: 1000, y: 1000 } }
  uniforms.scale = { type:"v2", value: { x: 3.5, y: 3.5 } }
  uniforms.offset = { type:"v2", value: { x: 0.0, y: 0.0 } }
  //Get shader code as a string
  var shaderCode = MyShaders.fractalShader;
  //Create our Pixi filter using our custom shader code
  var simpleShader = new PIXI.AbstractFilter('', shaderCode, uniforms);
  //Apply it to our object
  image.filters = [simpleShader]

  function animate() {
    uniforms.time.value += 0.1;
    // start the timer for the next animation loop
    requestAnimationFrame(animate);
    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
  }
  animate();
}
