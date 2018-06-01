
function startFractalPixi() {
  if('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(function() { log('Service worker registered.'); console.log('Service worker registered.'); });
  }

  window.myFractal = new FractalPixi();

  window.altFractal = new FractalPixi();
  altFractal
    .initialize("alt-view-container", "alt-fractal-pixi-canvas")
    .applyPreset("BLACK_WHITE")
    .startAnimation();
  altFractal.setJulia(true);
  altFractal.setShowFocusPoint(true);

  myFractal
    .initialize("fractal-container", "fractal-pixi-canvas")
    .setupUrlParamManager()
    .setupMouseInteraction()
    .setupTouchInteraction("julia", "burning-ship", "focus-point-lock", "oscillate")
    .setupUi("julia", "burning-ship", "focus-point-lock", "oscillate")
    .setUpdateCallback(altFractal)
    .startAnimation();

  setupKeyHandlerPixi();


  var menuButton = document.getElementById("menu-button");
  menuButton.onclick = function() {
    document.getElementById("side-menu").classList.toggle("active");
  }

  var saveImageButton = document.getElementById("download-button");
  saveImageButton.onclick = function() {
    var newFractal = makeNewFractal();
    downloadCanvasAsPng(document.getElementById("new-fractal-pixi-canvas"), "fractal.png");
    document.getElementById("new-fractal-pixi-canvas").remove();
  }
  saveImageButton.ontouchstart = function() {
    var newFractal = makeNewFractal();
    downloadCanvasAsPng(document.getElementById("new-fractal-pixi-canvas"), "fractal.png");
    document.getElementById("new-fractal-pixi-canvas").remove();
  }

  function makeNewFractal() {
    window.newFractal = new FractalPixi();

    newFractal
      .initialize("download-container", "new-fractal-pixi-canvas", true)
      .setupUrlParamManager()
      .setupMouseInteraction();

    newFractal.render();
  }
}
