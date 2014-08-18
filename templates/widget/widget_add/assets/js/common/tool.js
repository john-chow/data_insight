/**
 * 比较两个Object对象是否相等
 */
Object.equals = function( x, y ) {
  if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

  if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
      // other properties were tested using x.constructor === y.constructor

    if ( ! y.hasOwnProperty( p ) ) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

    if ( x[ p ] === y[ p ] ) continue;
      // if they have the same strict value or identity then they are equal

    if ( typeof( x[ p ] ) !== "object" ) return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

    if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
      // Objects and Arrays must be tested recursively
  }

  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
      // allows x[ p ] to be set to undefined
  }
  return true;
}

/**
 * 扩展js Array对象，获取指定对象的下标
 */
Array.prototype.indexOf = function(val) {  
	if(typeof val == "object"){
		for (var i = 0; i < this.length; i++) {  
			if (Object.equals(this[i], val)) return i;
		}
	}else{
		 for (var i = 0; i < this.length; i++) {  
		     if (this[i] == val) return i;  
		 }  
	}
    return -1;  
};  
/**
 * 拓展js数组对象，让其可以删除指定的元素
 */
Array.prototype.remove = function(val) {  
    
    if(!val) {
        return this;
    }

    function splice_array(arr, idx) {
        arr.splice(idx, 1);
        return arr
    }


    var cloned = this.slice(0);
    var idx = cloned.indexOf(val);
    if (idx >= 0) {
        return this.splice(idx, 1)
    }

    if(val instanceof Object) {
        for (var idx in this) {
            if ( JSON.stringify(this[idx]) === JSON.stringify(val) )
                return splice_array(cloned, idx)
        }
    }

    return cloned;
};  


function cloneObject(obj) {
    var objClone;
    if (obj.constructor == Object){
        objClone = new obj.constructor(); 
    } else if (obj instanceof Array) {
        objClone = new Array()
    } else{
        objClone = new obj.constructor(obj.valueOf()); 
    }
    for(var key in obj){
        if ( objClone[key] != obj[key] ){ 
            if ( typeof(obj[key]) == 'object' ){ 
                objClone[key] = cloneObject(obj[key]);
            }else{
                objClone[key] = obj[key];
            }
        }
    }
    objClone.toString = obj.toString;
    objClone.valueOf = obj.valueOf;
    return objClone; 
}

/**
 * 扩展js Array对象的方法，判断元素是否在数组中
 */
Array.prototype.S = String.fromCharCode(2);  
Array.prototype.in_array = function(e) {  
    var r = new RegExp(this.S+e+this.S);  
    return (r.test(this.S+this.join(this.S)+this.S));  
}; 

