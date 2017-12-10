
function MyFractal() {
  this.canvas = null;
  this.ctx = null;
  this.imgData;

  this.width = 800;
  this.height = 600;

  this.iterations = 200;
  this.bailout = 4;
  this.zoom = 0.002;
  this.offset_x = -1;
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
    for(y = 0; y < this.height; y++){
      for(x = 0; x < this.width; x++){
        var curIndex = (this.width * y + x)*4;

        var fColor = getFractalPointColor(
            ((x - this.width / 2) * this.zoom) + this.offset_x,
            ((y - this.height / 2) * this.zoom) + this.offset_y,
            this.iterations, this.bailout);
        d[curIndex++] = fColor[0];
        d[curIndex++] = fColor[1];
        d[curIndex++] = fColor[2];
        d[curIndex++] = 256;
      }
    }
    return this;
  }

  this.updateImage = function() {
    this.ctx.putImageData(this.imgData, 0, 0);
    return this;
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

function getFractalPointColor(x, y, iterations, bailout) {
  ret = [];
  zx = 0;
  zy = 0;
  cx = x;
  cy = y;

  for (i = 0; i < iterations; i++) {
    var x2 = zx * zx;
    var y2 = zy * zy;

    if (x2 + y2 > bailout) {
        ret = [Math.round((i/5)*256), Math.round((i/10)*256), Math.round((i/15)*256), 255];
        return ret;
    }

    zy = 2.0 * zx * zy + cy;
    zx = (x2 - y2) + cx;
  }

  if (i >= iterations) {
    ret = [0,0,0, 255];
  }
  return ret;
}
