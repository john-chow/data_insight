/*!
 * table路由
 * Date: 2014-7-25
 */
define([
	'region/table/controller'
], function (c) {

	var data = DataInsightManager.module("TableApp", function(TableApp, DataInsightManager, Backbone, Marionette, $, _){

	  //////////////////////////////////////////////////////////定义接口
	  var API = {
	    listTables: function(){
	      TableApp.Controller.ListTables();
	    }
	  };

	  //////////////////////////////////////////////////////////监听页面start
	  DataInsightManager.on("start", function(){
	    API.listTables();
	  });
	});

	return data;
});
