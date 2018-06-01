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
    let keys = Object.keys(this.uniforms);
    for(var i = 0; i < keys.length; i++) {
      let key = keys[i];
      this.uniforms[key].value = externalUniforms[key];
    }
    return this;
  }
}
