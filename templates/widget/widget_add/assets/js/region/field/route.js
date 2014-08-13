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
	    listFields: function(fields){
	      FieldRegion.Controller.ListFields(fields);
	    }
	  };

	  DataInsightManager.commands.setHandler("showField", function(fields){
		  API.listFields(fields);
	  });

	  DataInsightManager.on("showField", function(fields){
		  API.listFields(fields);
	  });
	});

	return data;
});
