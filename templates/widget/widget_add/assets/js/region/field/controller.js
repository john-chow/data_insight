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
			ListFields: function(tableName){

			//获取数据
			var fieldEntities = DataInsightManager.request("field:entities",tableName);

			$.when(fieldEntities).done(function(fields){

		    var fieldsListView = new FieldRegion.FieldView({
				collection: fields
			});
			
			fieldsListView.on("show:manage-dialog", function(){
				var fieldManageView = new FieldRegion.FieldManageDialog({
					collection: fields
				});

				fieldManageView.on("model:set", function(model, options){
					model.set(options);
				});

				fieldManageView.on("change:field-attributes",function(options){
					//解析数据
					var i, temp, j = -1, dataList = [],
					arrList = options.split("&");
					for(i = 0; i<arrList.length ; i++){
						temp = arrList[i].split("=");
						if(i%4==0){
							if(temp[1]=="1"){
								dataList[++j] = {};
							}
							else{
								i=i+3;
							}
						}
						else{
							dataList[j][temp[0]]=temp[1];
						}
					}
					//console.log(dataList);
					//ajax上传数据
					$.ajax({
		             	type: "POST",
		             	url: "/XXX",
		             	data: JSON.stringify(dataList),
		            	dataType: "json",
		            	success: function(data){
		            		DataInsightManager.dialogRegion.$el.modal("hide");
							DataInsightManager.trigger('showField', tableName);
		                }
		          	});
				});
				DataInsightManager.dialogRegion.show(fieldManageView);
			});
	        
			//显示View
			DataInsightManager.fieldRegion.show(fieldsListView);
		});
		}
		}
	});

	return data;
});
