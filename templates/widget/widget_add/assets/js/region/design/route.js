define([
	'region/design/controller'
], function (c) {

	var data = DataInsightManager.module("DesignRegion", function(DesignRegion, DataInsightManager, Backbone, Marionette, $, _){

	  //////////////////////////////////////////////////////////定义接口
	  var API = {
		showDesingView: function(){
	    	new DesignRegion.Controller();
	    }
	  };

	  //////////////////////////////////////////////////////////监听页面start
	  DataInsightManager.on("start", function(){
	    API.showDesingView();
	  });
	});

	return data;
});
