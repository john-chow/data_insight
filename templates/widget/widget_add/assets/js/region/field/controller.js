/*!
 * field控制器
 * Date: 2014-7-25
 */
define([
	'entities/field',
	'region/field/view'
], function (f, v) {

	var data = DataInsightManager.module("FieldRegion", function(FieldRegion, DataInsightManager,
	Backbone, Marionette, $, _){
		FieldRegion.Controller = {
			ListFields: function(id){

			/////////////////////////////获取数据
			var fields = DataInsightManager.request("field:entities",id);

			/////////////////////////////新建View
			var fieldsListView = new FieldRegion.Fields({
				collection: fields
			});
	        
			/////////////////////////////显示View
			DataInsightManager.fieldRegion.show(fieldsListView);
			}
		}
	});

	return data;
});
