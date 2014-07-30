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
	        , "echarts/chart/table": 	"lib/src/echarts-original"
	        , "echarts/chart/map": 		"lib/src/echarts-original-map"
	        , "validform":              "Validform_v5.3.2_min"
	        //, "csrf": 					"csrf"
	        , "themeDesign": 			"theme/design"
	        , "boxslider": 				"theme/box-slider-all.jquery.min"	
	        //, "echarts/config": 		"lib/src/config"
		},

		//添加依赖关系
		shim: {
			'backbone': {
	　　　　　　deps: ['underscore']
	　　　　},
			'color': {
        　　　　deps: ["bootstrap"]
	        },
			'model/vtron_model': {
				deps: ['backbone']
			},
			'base_sheet': {
				deps: ['backbone']
			},
	  		'draw_panel' : {
	  			deps: ['showmsg']
	  		},
	  		'themeDesign' : {
	  			deps: ['jqueryUi','bootstrap']
	  		},
	  		'boxslider': {
	  			deps: ['theme/Modernizr']
	  		},
	  	}
});
