/*!
 * table路由
 * Date: 2014-7-28
 */
define([
	'region/field/controller'
], function (c) {

	var data = DataInsightManager.module("FieldRegion", function(FieldRegion, DataInsightManager, Backbone, Marionette, $, _){

	  //定义接口
	  var API = {
	    listFields: function(tableName){
	      FieldRegion.Controller.ListFields(tableName);
	    }
	  };

	  DataInsightManager.commands.setHandler("showField", function(tableName){
		  API.listFields(tableName);
	  });

	  DataInsightManager.on("showField", function(tableName){
		  API.listFields(tableName);
	  });
	});

	return data;
});
