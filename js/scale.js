window.Scale = function(){
  var range;
  var domain;

  function scale(){
    console.log("domain:");
    console.log(domain);
    console.log("range:");
    console.log(range);
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
