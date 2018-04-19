function startFractalPixi() {
  window.myFractal = new MyFractalPixi();

  myFractal
    .initialize("fractalContainer")
    .animate();

  setupKeyHandlerPixi();
}
