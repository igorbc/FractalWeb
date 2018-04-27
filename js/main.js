function startFractalPixi() {
  window.myFractal = new MyFractalPixi();

  myFractal
    .initialize("fractal-container", "fractal-pixi")
    .setupUrlParamManager()
    .setupMouseInteraction()
    .setupTouchInteraction("julia", "burning-ship", "focus-point-lock")
    .setupUi("julia", "burning-ship", "focus-point-lock")
    .startAnimation();

  setupKeyHandlerPixi();

  var menuButton = document.getElementById("menu-button");
  menuButton.onclick = function() {
    document.getElementById("side-menu").classList.toggle("active");
  }

  var saveImageButton = document.getElementById("download-button");
  saveImageButton.onclick = function() {
    var newFractal = makeNewFractal();
    downloadCanvasAsPng(document.getElementById("new-fractal-pixi"), "fractal.png");
    document.getElementById("new-fractal-pixi").remove();
  }
  saveImageButton.ontouchstart = function() {
    var newFractal = makeNewFractal();
    downloadCanvasAsPng(document.getElementById("new-fractal-pixi"), "fractal.png");
    document.getElementById("new-fractal-pixi").remove();
  }

  function makeNewFractal() {
    window.newFractal = new MyFractalPixi();

    newFractal
      .initialize("download-container", "new-fractal-pixi", true)
      .setupUrlParamManager()
      .setupMouseInteraction();

    newFractal.urlParamManager.loadUrlParams();
    newFractal.updateUniforms();
    newFractal.render();
  }
}
