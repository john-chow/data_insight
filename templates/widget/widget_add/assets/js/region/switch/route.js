define([
	'region/switch/controller'
], function (c) {

	var data = DataInsightManager.module("SwitchRegion"
        , function(SwitchRegion, DataInsightManager, Backbone, Marionette, $, _) {

	  //////////////////////////////////////////////////////////定义接口
	  var API = {
		showAreaView: function(){
	    	new SwitchRegion.Controller();
	    }
	  };

	  //////////////////////////////////////////////////////////监听页面start
	  DataInsightManager.on("start", function(){
	    API.showAreaView();
	  });
	});

	return data;
});
