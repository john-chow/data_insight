/*!
 * 导入文件表单model
 * Date: 2014-8-6
 */
 define([], function () {

	var data = DataInsightManager.module("Entities",
	    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

		Entities.importFileForm = Backbone.Model.extend({
			urlRoot: "import_file_form",
			defaults: {
				"file": 	"",
				"type": 	"",
				"attr": 	"",
				"code": 	"",
			},
		}); 

		var API = {
			getInportFileEntity: function(){
				 var importFileEntity = new Entities.importFileForm();
				 return importFileEntity;
			},
		}

		DataInsightManager.reqres.setHandler("import-file:entity", function(){
				return API.getInportFileEntity();
		});
	});

	return data;
});