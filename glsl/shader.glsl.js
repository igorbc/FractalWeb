MyShaders = {
  fractalShader: `
    //Define the precision of floating numbers so GLSL doesn't complain
    precision mediump float;
    precision mediump int;

    uniform float time; //Declare that we're using this uniform
    uniform vec2 dimension;
    uniform vec2 scale;
    uniform vec2 offset;
    uniform int iterations;

    int getIterationLimit(int iterations, float time) {
      return int(float(iterations)/2.0 + (float(iterations)/2.0) * sin(time/10.0));
    }

    void main() {
      const float BAILOUT = 8.0;
      vec2 z = vec2(0.0, 0.0);
      vec2 c = vec2((gl_FragCoord.x / dimension.x - 0.5) * scale.x + offset.x,
                    (gl_FragCoord.y / dimension.y - 0.4) * scale.y + offset.y);
      int iterationLimit;
      int count;
      for(int i = 0; i < 1000; i++){
        count = i;
        iterationLimit = getIterationLimit(iterations, time);
        if(i >= iterationLimit){
          break;
        }

        vec2 z2 = vec2(z.x * z.x, z.y * z.y);

        if (z2.x + z2.y > BAILOUT) {
          float v = float(i)/float(iterationLimit);
          gl_FragColor = vec4(v,v,v,1.0);
          break;
        }

        z.y = 2.0 * z.x * z.y + c.y;
        z.x = (z2.x - z2.y) + c.x;
        count = i;
      }
      iterationLimit = getIterationLimit(iterations, time);
      if(count >= iterationLimit){
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
      }
    }
  `
}
