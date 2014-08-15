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
	    listFields: function(fields, tableName){
	      FieldRegion.Controller.ListFields(fields, tableName);
	    }
	  };

	  DataInsightManager.commands.setHandler("showField", function(fields, tableName){
		  API.listFields(fields, tableName);
	  });

	  DataInsightManager.on("showField", function(fields, tableName){
		  API.listFields(fields, tableName);
	  });
	});

	return data;
});
