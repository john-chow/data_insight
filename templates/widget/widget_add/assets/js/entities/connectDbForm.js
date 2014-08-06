/*!
 * 连接数据库表单model
 * Date: 2014-8-5
 */
 define([], function () {

	var data = DataInsightManager.module("Entities",
	    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

		Entities.connectForm = Backbone.Model.extend({
			url: "/connect/db/",
			defaults: {
				"ip": 		"10.1.50.125",
				"port": 	"5432",
				"db": 		"data_insight",
				"user": 	"postgres",
				"pwd": 		"",
				"dbName": 	"",
			},
			validate: function(attrs, options) {
		      var errors = {}
		      if (! attrs.ip) {
		        errors.ip = "不能为空";
		      }
		      if (! attrs.port) {
		        errors.port = "不能为空";
		      }
		      if (! attrs.db) {
		        errors.db = "不能为空";
		      }
		      if (! attrs.user) {
		        errors.user = "不能为空";
		      }
		      if (! attrs.pwd) {
		        errors.pwd = "不能为空";
		      }
		      if( ! _.isEmpty(errors)){
		        return errors;
		      }
		    }
		}); 

		var API = {
			getConnectEntity: function(){
				 var connectEntity = new Entities.connectForm();
				 return connectEntity;
			},
		}

		DataInsightManager.reqres.setHandler("connect:entity", function(){
				return API.getConnectEntity();
		});
	});

	return data;
});
