window.Scale = function(){
  var range;
  var domain;

  function scale(n){
    if(typeof n === "undefined") return;
    if((typeof domain === "undefined") || (typeof range === "undefined")) throw "Before using set domain and range";

    if(range.length > 2) {
      for(var i = 0; i < range.length - 1; i++){

      }
    }

    var diffDomain = domain[1] - domain[0];
    var diffRange = range[1] - range[0];
    return range[0] + ((n - domain[0])/diffDomain) * diffRange;
  }

  scale.domain = function(d){
    if (typeof d === "undefined") return domain;
    if(!Array.isArray(d)) throw "Domain should be an Array";
    if(d.length != 2) throw "Range should be a 2 element Array";
    domain = d;
    return this;
  }

  scale.range = function(r){
    if (typeof r === "undefined") return range;
    if(!Array.isArray(r)) throw "Range should be an Array";
    range = r;
    return this;
  }

  return scale;
}
