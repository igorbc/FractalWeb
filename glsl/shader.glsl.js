MyShaders = {
  fractalShader: `
    //Define the precision of floating numbers so GLSL doesn't complain
    precision highp float;
    precision highp int;

    uniform bool isJulia;
    uniform bool burningShip;
    uniform bool oscillate;
    uniform float time; //Declare that we're using this uniform
    uniform vec2 dimension;
    uniform vec2 scale;
    uniform vec2 offset;
    uniform int iterations;
    uniform vec2 mousePosition;
    uniform vec2 focusPoint;
    uniform vec3 bailoutColor;
    uniform int numColors;
    uniform float stops[8];
    uniform vec3 colors[8];

    int getIterationLimit(in int iterations, in float time) {
      if (oscillate)
        return 1 + int(float(iterations)/2.0 + (float(iterations)/2.0) * sin(time/8.0));
      else
        return iterations;
    }

    vec3 rgb2hsb( in vec3 c ){
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz),
                     vec4(c.gb, K.xy),
                     step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r),
                     vec4(c.r, p.yzx),
                     step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                    d / (q.x + e),
                    q.x);
    }

    //  Function from Iñigo Quiles
    //  https://www.shadertoy.com/view/MsS3Wc
    vec3 hsb2rgb( in vec3 c ){
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                 6.0)-3.0)-1.0,
                         0.0,
                         1.0 );
        rgb = rgb*rgb*(3.0-2.0*rgb);
        return c.z * mix(vec3(1.0), rgb, c.y);
    }


    float lmap(in float val, in float inMin, in float inMax, in float outMin, in float outMax) {
      return clamp(outMin + ((outMax - outMin) * (val - inMin)) / (inMax - inMin), outMin, outMax);
    }

    vec4 getColor(in float i, in float maxI) {
      float v = i/maxI;
      vec4 myColor;
      for (int i = 1; i < 8; i ++) {

        if (v <= stops[i]) {
          float stopPercentage = lmap(v, stops[i-1], stops[i], 0.0, 1.0);
          myColor = vec4(mix(colors[i-1], colors[i], stopPercentage), 1.0);
          return myColor;
        }
        if (i >= 4) return myColor;
      }
      // edge case, in case the last stop is not at 1.0
      // return vec4(colors[numColors - 1], 1.0);
    }

    void main() {
      const float BAILOUT = 8.0;
      vec2 z;
      vec2 c;
      vec2 adjustedPos = vec2(((gl_FragCoord.x - dimension.x/2.0) / max(dimension.y, dimension.x)),
                             -((gl_FragCoord.y - dimension.y/2.0) / max(dimension.y, dimension.x)));
      if (isJulia) {
        c = focusPoint;

        z = vec2(adjustedPos.x / scale.x + offset.x,
                 adjustedPos.y / scale.y + offset.y);
      }
      else {
        z = vec2(0.0, 0.0);
        c = vec2(adjustedPos.x / scale.x + offset.x,
                 adjustedPos.y / scale.y + offset.y);
      }

      int iterationLimit;
      int count;
      for(int i = 0; i < 1000; i++){
        count = i;
        iterationLimit = getIterationLimit(iterations, time);
        if(i >= iterationLimit){
          break;
        }

        vec2 z2 = z * z;

        if (z2.x + z2.y > BAILOUT) {
          gl_FragColor = getColor(float(i), float(iterationLimit));
          break;
        }

        if (burningShip)
          z = vec2(z2.x - z2.y, abs(2.0 * z.x * z.y)) + c;
        else
          z = vec2(z2.x - z2.y, 2.0 * z.x * z.y) + c;
        count = i;
      }
      iterationLimit = getIterationLimit(iterations, time);
      if(count >= iterationLimit){
        gl_FragColor = vec4(bailoutColor, 1.0);
      }
    }
  `
}
