function MyFractal() {
  this.canvas = null;
  this.ctx = null;
  this.imgData;

  this.width = 800;
  this.height = 600;

  this.iterations = 200;
  this.bailout = 4;
  this.zoom = 0.0035;
  this.offset_x = -0.6;
  this.offset_y = 0.0;

  this.initialize = function(elementId){
    this.canvas = document.getElementById(elementId);
    this.ctx = this.canvas.getContext("2d");

    this.imgData = this.ctx.createImageData(this.width, this.height);
    console.log(this.imgData.data);
    return this;
  }

  this.updateImageData = function() {
    var d = this.imgData.data;
    var x;
    var y;
    var curIndex;
    for(y = 0; y < this.height; y++){
      for(x = 0; x < this.width; x++){
        curIndex = (this.width * y + x)*4;

        var fColor = getFractalPointColor(
            ((x - this.width / 2) * this.zoom) + this.offset_x,
            ((y - this.height / 2) * this.zoom) + this.offset_y,
            this.iterations, this.bailout, this.getColor);
        d[curIndex++] = fColor[0];
        d[curIndex++] = fColor[1];
        d[curIndex++] = fColor[2];
        d[curIndex++] = 255;
      }
    }
    return this;
  }

  this.updateImage = function() {
    this.ctx.putImageData(this.imgData, 0, 0);
    return this;
  }

  this.getColor = function(n) {
    h = (n*10) % 1;
    s = (n*-6) % 1;
    l = (n*10) % 1;
    return hslToRgb(h,s,l);
  }
}

function startFractal() {
  window.myFractal = new MyFractal();

  myFractal
    .initialize("canvasFractal")
    .updateImageData()
    .updateImage();

  setupKeyHandler();
  console.log(myFractal.imgData);
}

function getFractalPointColor(x, y, iterations, bailout, colorFunction) {
  ret = [];
  zr = 0;
  zi = 0;
  cr = x;
  ci = y;

  for (i = 0; i < iterations; i++) {
    var zr2 = zr * zr;
    var zi2 = zi * zi;

    if (zr2 + zi2 > bailout) {
        ret = colorFunction(i/iterations);
        return ret;
    }

    zi = 2 * zr * zi + ci;
    zr = (zr2 - zi2) + cr;
    //zi = zi < 0 ? -zi : zi;
    //zr = zr < 0 ? -zr : zr;
  }

  if (i >= iterations) {
    ret = [0,0,0];
  }
  return ret;
}
