describe("FractalPixi", function() {
  describe("when instanciating", function(){
    it("creates a valid object", function(){
      var fractal = new FractalPixi();
      expect(fractal).not.toBeNull();
    });
  });

  describe("#initialize", function(){
    var fractal;
    beforeEach(function(){
       fractal = new FractalPixi();
    });
    describe("with invalid arguments", function(){
      it("throws exception", function(){
        expect(function(){
          fractal.initialize();
        }).toThrowError("container id and canvas id must be provided");
      });
    });
  });
});
