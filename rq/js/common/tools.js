// 字符串格式化
function String_format(){
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {       
	  	var reg = new RegExp("\\{" + i + "\\}", "gm");             
	  	s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}


// 支持 [_, _, _, .....]和
// [{}，{}，....]的删除操作
function Delete_from_array(list, val) {
	if( !(list instanceof Array) ) {
		return list
	}
	if(!val) {
		return list
	}

	function splice_array(arr, idx) {
		arr.splice(idx, 1);
		return arr
	}


	var cloned = list.slice(0);
	var idx = cloned.indexOf(val);
	if (idx >= 0) {
		return splice_array(cloned, idx)
	}

	if(val instanceof Object) {
		for (var idx in list) {
			if ( JSON.stringify(list[idx]) === JSON.stringify(val) )
				return splice_array(cloned, idx)
		}
	}

	return cloned
}

//统一显示错误
function show_error_meassage(message, level){
	$(".error_level").html(level);
	$(".error_message").html(message);
	$("#error_modal>div").modal();
}



