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
    downloadCanvasAsPng(document.getElementById("fractal-pixi"), "fractal.png");
  }
  saveImageButton.ontouchstart = function() {
    downloadCanvasAsPng(document.getElementById("fractal-pixi"), "fractal.png");
  }
}
