/*!
 * table控制器
 * Date: 2014-7-25
 */
define([
	'entities/table',
	'region/table/view'
], function (t, v) {

	var data = DataInsightManager.module("TableRegion", function(TableRegion, DataInsightManager,
	Backbone, Marionette, $, _){
		TableRegion.Controller = {
			ListTables: function(){

			/////////////////////////////获取数据
			var tables = DataInsightManager.request("table:entities");

			/////////////////////////////新建View
			var tablesListView = new TableRegion.Tables({
				collection: tables
			});

			/////////////////////////////注册事件
			tablesListView.on("table:init", function(collection){
	          	DataInsightManager.execute("showField", collection.at(0).get("id"));
	        });

		    tablesListView.on("childview:change:table", function(childView, model){
	          	DataInsightManager.execute("showField", model.get("id"));
	        });

	        tablesListView.on("show:dialog-new-table", function(){
	        	var newTableView = new TableRegion.newTableDialog();
				DataInsightManager.dialogRegion.show(newTableView);

	        });

	        DataInsightManager.dialogRegion.on("show:dialog-choosed-db", function(){
		        var choosedDbView = new TableRegion.choosedDbDialog();
				DataInsightManager.dialogRegion.show(choosedDbView);
					
		    });

		    DataInsightManager.dialogRegion.on("show:dialog-import-file", function(){
		        var importFileView = new TableRegion.importFileDialog();
				DataInsightManager.dialogRegion.show(importFileView);
		    });

	        
			/////////////////////////////显示View
			DataInsightManager.tableRegion.show(tablesListView);

			}
		}
	});

	return data;
});
