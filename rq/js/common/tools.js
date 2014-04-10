// 字符串格式化
function String_format(){
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {       
	  	var reg = new RegExp("\\{" + i + "\\}", "gm");             
	  	s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}


function Delete_from_array(list, val) {
	if( (list instanceof Array) 
		&& val ) {

		var cloned = list.slice(0);
		var idx = cloned.indexOf(val);
		if (idx >= 0) {
			cloned.splice(idx, 1)
		}

		return cloned
	}
}
