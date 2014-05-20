requirejs.config({
		baseUrl: window.resourceJs,
		// 这里paths的默认路径就是上面的baseUrl
		// 如果没有设置baseUrl, 那么默认路径就是加载require.js的html所在的路径
		paths: {
			"jquery": 					"lib/jquery-2.1.0"
	        , "jqueryUi": 				"lib/jquery-ui-1.10.4.custom.min"
	        , "backbone": 				"lib/backbone"
	        , "underscore": 			"lib/underscore"
	        , "bootstrap": 				"lib/bootstrap"
	        , "color":  				"lib/jquery.minicolors"
	        , "gridster": 				"lib/jquery.gridster"
	        , "easydialog": 			"lib/easydialog"
	        , "echarts": 				"lib/src/echarts-original"
	        , "echarts/chart/bar": 		"lib/src/echarts-original"
	        , "echarts/chart/line": 	"lib/src/echarts-original"
	        , "echarts/chart/scatter": 	"lib/src/echarts-original"
	        , "echarts/chart/pie": 		"lib/src/echarts-original"
	        , "echarts/chart/radar": 	"lib/src/echarts-original"
	        , "echarts/chart/map": 		"lib/src/echarts-original-map"
	        , "validform":              "Validform_v5.3.2_min"
	        , "csrf": 					"csrf"
	        //, "echarts/config": 		"lib/src/config"
		},

		//添加依赖关系
		shim: {
	　　　　'bootstrap': {
	　　　　　　deps: ['jquery']
	　　　　},
			'backbone': {
	　　　　　　deps: ['underscore', 'jquery']
	　　　　},
			'jqueryUi': {
			　　deps: ['jquery']
			},
			'color': {
        　　　　deps: ['jquery',"bootstrap"]
	        },
	        'gridster': {
	            deps: ['jquery']
			},
			'model/vtron_model': {
				deps: ['backbone']
			},
			'base_sheet': {
				deps: ['backbone']
			},
			'validform': {
　　　　　　	deps: ['jquery']
	  		},
	  		'csrf' : {
	  			deps: ['jquery']
	  		}
	  	}
});
/*requirejs(['validform'], function(){
        var validateFrom = $("#user_register").Validform({
        tiptype:function(msg,o,cssctl){
        var objtip=$(".error-box");
        cssctl(objtip,o.type);
        objtip.text(msg);
    },
    });
   validateFrom.tipmsg.reck = "两次密码不一样";
})*/
