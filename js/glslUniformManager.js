function GlslUniforms() {

  this.initialize = function(uniforms) {
    this.uniforms = {};
    for(var i = 0; i < uniforms.length; i++) {
      this.uniforms[uniforms[i].name] = uniforms[i].uniform;
    }
    return this;
  };

  this.getUniforms = function() {
    return this.uniforms;
  };

  this.update = function(externalUniforms) {
    for(var i = 0; i < this.uniforms.length; i++) {
      this.uniforms[externalUniforms[this.uniforms[i]].name].value = externalUniforms[this.uniforms[i].name];
    }
    return this;
  }
}
