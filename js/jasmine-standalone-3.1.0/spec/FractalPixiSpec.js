describe("FractalPixi", function() {
  var fractal;
  beforeEach(function(){
     fractal = new FractalPixi();
  });

  describe("when instantiating", function(){
    it("creates a valid object", function(){
      expect(fractal).not.toBeNull();
    });

    it("does not expose internal fields", function(){
      expect(fractal.offset).toBeUndefined();
    });

    it("exposes internal API", function(){
      expect(fractal.zoomOut).toBeDefined();
    });
  });

  describe("#initialize", function(){

    describe("with invalid arguments", function(){
      it("throws exception", function(){
        expect(function(){
          fractal.initialize();
        }).toThrowError("container id and canvas id must be provided");
      });
    });
  });
});
