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

}
