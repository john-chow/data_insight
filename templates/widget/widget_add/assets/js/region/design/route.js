define([
	'region/design/controller'
], function (c) {

	var data = DataInsightManager.module("DesignRegion", function(DesignRegion, DataInsightManager, Backbone, Marionette, $, _){

	  //////////////////////////////////////////////////////////定义接口
	  var API = {
	    showGraph: function(){
	    	DesignRegion.Controller.showGraph();
	    }
	  };

	  //////////////////////////////////////////////////////////监听页面start
	  DataInsightManager.on("start", function(){
	    API.showGraph();
	  });
	});

	return data;
});
