define([
	'region/operate/controller'
], function (c) {

	DataInsightManager.module("OperateRegion"
        , function(OperateRegion, DataInsightManager, Backbone, Marionette, $, _) {

	  //////////////////////////////////////////////////////////定义接口
	  var API = {
		showOperateView: function(){
	    	new OperateRegion.Controller();
	    }
	  };

	  //////////////////////////////////////////////////////////监听页面start
	  DataInsightManager.on("start", function(){
	    API.showOperateView();
	  });
	})
});
