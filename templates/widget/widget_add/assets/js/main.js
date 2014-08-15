/*!
 * 配置requirejs和启动marionette
 * Date: 2014-7-25
 */
requirejs.config({
    
    baseUrl: '/static/assets/js/',

    paths: {
        	"jquery": 			"lib/jquery",
        	"jquery-ui":		"lib/jquery-ui",
	        "json2": 			"lib/json2",
	        "underscore": 		"lib/underscore",
	        "backbone": 		"lib/backbone",
	        "marionette": 		"lib/backbone.marionette",
	        "text":				"lib/text",
	        "spin":				"lib/spin",
	        "spin-jquery":		"lib/spin.jquery",
	        "bootstrap":		"lib/bootstrap",
	        "ajaxfileupload": 	"lib/ajaxfileupload",
	        "tool": 			"common/tool",
	        "csrf": 			"lib/csrf",
	        "minicolors":		"lib/jquery.minicolors",
	        "echarts": 		    "lib/src/echarts-original"
	        , "echarts/chart/bar": 		"lib/src/echarts-original"
	        , "echarts/chart/line": 	"lib/src/echarts-original"
	        , "echarts/chart/scatter": 	"lib/src/echarts-original"
	        , "echarts/chart/pie": 		"lib/src/echarts-original"
	        , "echarts/chart/radar": 	"lib/src/echarts-original"
	        , "echarts/chart/table": 	"lib/src/echarts-original"
	        , "echarts/chart/map": 		"lib/src/echarts-original-map"
    },

    //添加依赖关系
	shim: {
			'underscore': {
	　　　　　　deps: ['jquery']
	　　　　},
			'backbone': {
	　　　　　　deps: ['underscore']
	　　　　},
	  		'marionette': {
	  			deps: ['backbone']
	  		}
	  }
});

require([
	'marionette',
], function (DataInsightManager) {

	//先加载Marionette
	var DataInsightManager = new Marionette.Application();
	window.DataInsightManager = DataInsightManager;
	
	//启动app
	require(['app','common/screen_adaptation'], function() {
		DataInsightManager.start();
	})
});

