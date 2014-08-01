/*!
 * table控制器
 * Date: 2014-7-25
 */
define([
	'entities/table',
	'region/table/view'
], function (v) {

	var data = DataInsightManager.module("TableRegion", function(TableRegion, DataInsightManager,
	Backbone, Marionette, $, _){
		TableRegion.Controller = {
			ShowTable: function(collection){

			//新建View，分情况，一种是有数据，一种无数据
			var showTableView;
			if(collection){
				showTableView = new TableRegion.TableView({
					collection: collection
				});
				showTableView.on("show:new-table", function(){
					DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", collection);
	       		});
			}
			else{
				showTableView = new TableRegion.TableView({
					collection: new (Backbone.Collection.extend({}))
				});
				showTableView.on("show:new-table", function(){
					DataInsightManager.dialogRegion.trigger("show:dialog-new-table");
				});
			}

			showTableView.on("change:table", function(id){
	          	DataInsightManager.execute("showField", id);
	       	});

			//注册事件，为避免嵌套，事件均绑定到dialogRegion，而不是View
			DataInsightManager.dialogRegion.on("show:dialog-new-table", function(){
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

		    DataInsightManager.dialogRegion.on("show:dialog-connect-db", function(){
		        var connectDbView = new TableRegion.connectDbDialog();
				DataInsightManager.dialogRegion.show(connectDbView);
		    });

		    DataInsightManager.dialogRegion.on("import:db-file", function(options){
		    	//导入表,前台还是后台？未做
		    	DataInsightManager.dialogRegion.$el.modal("hide");
		    })

		    DataInsightManager.dialogRegion.on("show:dialog-table-manage", function(variable){
		    	if(!variable.models)
					variable = DataInsightManager.request("table:entities", variable);
				//需要验证连接第三方账号密码是否正确，这里假设成功
				var tableManageView = new TableRegion.tableManageDialog({
					collection: variable
				});
				tableManageView.on("manage:new-table", function(){
	        		DataInsightManager.dialogRegion.trigger("show:dialog-new-table");
	        	});
				DataInsightManager.dialogRegion.show(tableManageView);
		    });

		    DataInsightManager.dialogRegion.on("table:list", function(collection){
		    	DataInsightManager.dialogRegion.$el.modal("hide");
		    	DataInsightManager.trigger('table:list', collection);
		    })

			//显示View
			DataInsightManager.tableRegion.show(showTableView);

			}
		}
	});

	return data;
});
