var WIDTH = 800;
var HEIGHT = 600;
var ITERATIONS = 200;
var BAILOUT = 2.0;

var ZOOM = 0.002;

var OFFSET_X = -1;
var OFFSET_Y = 0.0;


function startFractal() {
  var canvas = document.getElementById("canvasFractal");
  var ctx = canvas.getContext("2d");
  var imgData = ctx.createImageData(WIDTH, HEIGHT);

  drawImageData(imgData.data)

  ctx.putImageData(imgData, 0, 0);

  console.log(imgData);
}

function drawImageData(d) {
  var x;
  var y;
  for(y = 0; y < HEIGHT; y++){
    for(x = 0; x < WIDTH; x++){
      var curIndex = (WIDTH * y + x)*4;

      var fColor = getFractalPointColor(
          ((x - WIDTH / 2) * ZOOM) + OFFSET_X,
          ((y - HEIGHT / 2) * ZOOM) + OFFSET_Y);
      d[curIndex++] = fColor[0];
      d[curIndex++] = fColor[1];
      d[curIndex++] = fColor[2];
      d[curIndex++] = 256;
    }
  }
}

function getFractalPointColor(x, y) {
  ret = [];
  zx = 0;
  zy = 0;
  cx = x;
  cy = y;

  for (i = 0; i < ITERATIONS; i++) {
    var x2 = zx * zx;
    var y2 = zy * zy;

    if (x2 + y2 > BAILOUT * BAILOUT) {
        ret = [Math.round((i/5)*256), Math.round((i/10)*256), Math.round((i/15)*256), 255];
        return ret;
    }

    zy = 2.0 * zx * zy + cy;
    zx = (x2 - y2) + cx;
  }

  if (i >= ITERATIONS) {
    ret = [0,0,0, 255];
  }
  return ret;
}
