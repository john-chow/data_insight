/*!
 * table路由
 * Date: 2014-7-28
 */
define([
	'region/field/controller'
], function (c) {

	var data = DataInsightManager.module("FieldRegion", function(FieldRegion, DataInsightManager, Backbone, Marionette, $, _){

	  //////////////////////////////////////////////////////////定义接口
	  var API = {
	    listFields: function(id){
	      FieldRegion.Controller.ListFields(id);
	    }
	  };

	  //////////////////////////////////////////////////////////监听页面start
	  DataInsightManager.on("start", function(){
	    API.listFields();
	  });

	  //////////////////////////////////////////////////////////
	  DataInsightManager.commands.setHandler("showField", function(id){
		  API.listFields(id);
	  });

	  DataInsightManager.on("showField", function(id){
		  API.listFields(id);
	  });
	});

	return data;
});
