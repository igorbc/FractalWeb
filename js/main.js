function startFractalPixi() {
  window.myFractal = new MyFractalPixi();

  myFractal
    .initialize("fractal-container", "fractal-pixi")
    .setupUrlParamManager()
    .setupMouseInteraction()
    .setupTouchInteraction("julia-button", "burning-ship-button")
    .setupUi("julia-button", "burning-ship-button")
    .startAnimation();

  setupKeyHandlerPixi();
  var menuButton = document.getElementById("menu-button");
  menuButton.onclick = function() {
    document.getElementById("side-menu").classList.toggle("active");
  }

  var saveImageButton = document.getElementById("save-png-button");
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
