/*!
 * table路由
 * Date: 2014-7-25
 */
define([
	'region/table/controller'
], function (c) {

	var data = DataInsightManager.module("TableRegion", function(TableRegion, DataInsightManager, Backbone, Marionette, $, _){

	  //////////////////////////////////////////////////////////定义接口
	  var API = {
	    showTable: function(collection){
	      TableRegion.Controller.ShowTable(collection);
	    }
	  };

	  //////////////////////////////////////////////////////////监听页面start
	  DataInsightManager.on("start", function(){
	    API.showTable();
	  });

	  DataInsightManager.on("table:list", function(collection){
	    API.showTable(collection);
	  });
	});

	return data;
});
