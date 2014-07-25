/*!
 * table控制器
 * Date: 2014-7-25
 */
define([
	'entities/table',
	'region/table/view'
], function (t, v) {

	var data = DataInsightManager.module("TableApp", function(TableApp, DataInsightManager,
	Backbone, Marionette, $, _){
		TableApp.Controller = {
			ListTables: function(){

			/////////////////////////////获取数据
			var tables = DataInsightManager.request("table:entities");

			/////////////////////////////新建View
			var tablesListView = new TableApp.Tables({
				collection: tables
			});

			/////////////////////////////注册事件
			tablesListView.on("table:test", function(childView, args){
		          DataInsightManager.trigger("table:test", args);
		    });

			/////////////////////////////显示View
			DataInsightManager.tableRegion.show(tablesListView);


			///dialog test
			//var dialogView = new TableApp.Dialog();
			//DataInsightManager.dialogRegion.show(dialogView);
			}
		}
	});

	return data;
});
