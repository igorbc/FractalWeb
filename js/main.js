function startFractalPixi() {
  window.myFractal = new MyFractalPixi();

  myFractal
    .initialize("fractal-container", "fractal-pixi")
    .loadUrlParams()
    .setupMouseInteraction()
    .setupTouchInteraction("julia-button", "burning-ship-button")
    .setupUi("julia-button", "burning-ship-button")
    .startAnimation();

  setupKeyHandlerPixi();
}
