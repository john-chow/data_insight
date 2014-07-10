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


function clone_canvas(oldCanvas) {
    //create a new canvas
    //var newCanvas = document.createElement('canvas');
	var newCanvas = oldCanvas.cloneNode();
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}



function jquery_to_html($obj) {
	var tmp = jQuery('<div>');
	jQuery.each($obj, function(index, item){
		if(!jQuery.nodeName(item, "script")){
			tmp.append(item);
		}
	});
	return tmp.html();
}

//错误提示弹出窗口
function easy_dialog_error(message, level){
	var str="<p>错误级别：<span id='error_level'>"+level+"</span></p>"+
			"<p>错误信息：<span id='error_message'>"+message+"</span></p>";
    var width = (document.documentElement.clientWidth)/2-160;
	easyDialog.open({
	  container : {
	    header : '错误提示&nbsp;&nbsp;&nbsp;(5秒后自动关闭)',
	    content : str
	  },
	  overlay : false,
	  autoClose : 5000,
      follow:'header',
      followX : width,
      followY : 77
	});
}

//loading弹出窗口
function easy_dialog_loading(){
	var str="<img id='loading_img' src='/static/images/loading.gif' /><span>正在加载，请稍后~</span>";
	easyDialog.open({
        container : {
    		content : str
 		},
    });
}

//关闭窗口
function easy_dialog_close(){
	   easyDialog.close();
}


function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


// 用clone实现对象的复制功能
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


// 绑定函数执行的上下文
// 抄underscore
function bindContext(func, context) {
    var nativeBind = Function.prototype.bind;
    var slice = Array.prototype.slice;
    var args, bound;
    if (nativeBind && func.bind === nativeBind) 
        return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        ctor.prototype = func.prototype;
        var self = new ctor;
        ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) return result;
        return self;
    }
}

//扩展js Array对象，使其可以删除指定元素
Array.prototype.indexOf = function(val) {              
    for (var i = 0; i < this.length; i++) {  
        if (this[i] == val) return i;  
    }  
    return -1;  
};  

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

    return cloned
};  


// 监听服务器事件，接收服务器推送数据
function ListenToServer(url, evName, openCallBack, failCallBack, succCallBack) {
    var source = new EventSource(url);
    source.onopen = function() {
        if (openCallBack)       openCallBack()
    }

    source.onerror = function() {
        if (failCallBack)       failCallBack()
    }

    source.addEventListener(evName, function(e) { 
        if (succCallBack)       succCallBack(e)
    }, false)
}


