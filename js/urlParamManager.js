function URLParamManager() {

  this.initialize = function(object, paramsInfo) {
    this.object = object;
    this.paramsInfo = paramsInfo;
    return this;
  }

  this.loadUrlParams = function() {
    var urlString = window.location.href;
    var url = new URL(urlString);
    var params = url.searchParams;

    for(var i = 0; i < this.paramsInfo.length; i++) {
      this.object[this.paramsInfo[i].varName] =
        this.parseFunctions[this.paramsInfo[i].type](
          this.object[this.paramsInfo[i].varName],
          params.get(this.paramsInfo[i].paramName)
        );
    }

    for(var i = 0; i < this.object.colors.length; i++) {
      // this.object.colors[i] = this.parseAndGetVec3(this.object.colors[i], params.get("color"+i));
      this.object.stops[i] = this.parseAndGetFloat(this.object.stops[i], params.get("stop"+i));
    }

    return this;
  }

  this.updateUrlParams = function() {
    var urlString = window.location.href;
    var url = new URL(urlString);
    var newUrl = url.origin + url.pathname + "?";

    newUrl += this.getParams();

    history.replaceState({}, null, newUrl);
    return this;
  }

  this.getParams = function() {
    var params = "";
    for(var i = 0; i < this.paramsInfo.length; i++) {
      params += this.getParamString(this.paramsInfo[i]);
    }
    return params;
  }

  this.getParamString = function(paramInfo) {
    var paramString = "&" + paramInfo.paramName + "=";
    var val = this.object[paramInfo.varName];

    if(paramInfo.type == "vec3")
      paramString += val.x + "," + val.y + "," + val.z;
    else if(paramInfo.type == "vec2")
      paramString += val.x + "," + val.y;
    else if(paramInfo.type == "int" || paramInfo.type == "float")
      paramString += val;
    else if(paramInfo.type == "aint")
      paramString += val.toString();
    else if(paramInfo.type == "bool")
      paramString += val;
    else if(paramInfo.type == "avec3") {
      for(var i = 0; i < val.length; i++){
        paramString += val[i].x + "," + val[i].y + "," + val[i].z + ";"
      }
      paramString = paramString.slice(0, -1);
    }

    return paramString;
  }

  this.parseAndGetInt = function(originalValue, newValue) {
    var value = Number(newValue);
    if(value) return value;
    return originalValue;
  }

  this.parseAndGetIntArray = function(originalValue, newValue) {
    var newValues = [];
    if(newValue) {
      var intArray = newValue.split(",");
      if(intArray.length > 0) {
        for(var i = 0; i < Math.min(intArray.length, originalValue.length); i++) {
          newValues[i] = this.parseAndGetInt(originalValue[i], intArray[i]);
        }
      }
      return newValues;
    }
    return originalValue;
  }

  this.parseAndGetFloat = function(originalValue, newValue) {
    var value = Number(newValue);
    if(value) return value;
    return originalValue;
  }

  this.parseAndGetBool = function(originalValue, newValue) {
    if(newValue) {
      return newValue == "true"
    }
    return originalValue;
  }

  this.parseAndGetVec3 = function(originalValue, newValue) {
    if(newValue) {
      var vec3Array = newValue.split(",");

      if(vec3Array.length == 3) {
        var vec3 = { x: Number(vec3Array[0]),
                     y: Number(vec3Array[1]),
                     z: Number(vec3Array[2]) };
        if(!isNaN(vec3.x) && !isNaN(vec3.y) && !isNaN(vec3.z)) {
          return vec3;
        }
      }
    }
    return originalValue;
  }

  this.parseAndGetVec3Array = function(originalValue, newValue) {
    var newValues = [];
    if(newValue) {
      var vec3Array = newValue.split(";");
      if(vec3Array.length > 0) {
        for(var i = 0; i < Math.max(vec3Array.length, originalValue.length); i++) {
          newValues[i] = this.parseAndGetVec3(originalValue[i], vec3Array[i]);
        }
      }
      return newValues;
    }
    return originalValue;
  }

  this.parseAndGetVec2 = function(originalValue, newValue) {
    if(newValue) {
      var vec2Array = newValue.split(",");
      if(vec2Array.length == 2) {
        var vec2 = { x: Number(vec2Array[0]),
                     y: Number(vec2Array[1]) };
        if(!isNaN(vec2.x) && !isNaN(vec2.y)) {
          return vec2;
        }
      }
    }
    return originalValue;
  }

  this.parseFunctions = {
    "bool": this.parseAndGetBool,
    "int": this.parseAndGetInt,
    "float": this.parseAndGetFloat,
    "vec2": this.parseAndGetVec2,
    "vec3": this.parseAndGetVec3,
    "aint": (this.parseAndGetIntArray).bind(this),
    "avec3": (this.parseAndGetVec3Array).bind(this)
  }
}
