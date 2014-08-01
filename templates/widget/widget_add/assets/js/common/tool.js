/**
 * 扩展js Array对象，获取指定对象的下标
 */
Array.prototype.indexOf = function(val) {  
	if(typeof val == "object"){
		for (var i = 0; i < this.length; i++) {  
			if (JSON.stringify(this[i]) == JSON.stringify(val)) return i;
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