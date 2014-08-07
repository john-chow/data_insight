/*!
 * table控制器
 * Date: 2014-7-25
 */
define([
	'entities/table',
	'entities/connectDbForm',
	'entities/importFileForm',
	'region/table/view'
], function (v) {

	var data = DataInsightManager.module("TableRegion", function(TableRegion, DataInsightManager,
	Backbone, Marionette, $, _){
		TableRegion.Controller = {
			ShowTable: function(collection){

			/*
			* 新建View，分两情况,一种是有数据，一种无数据
			*/
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

			/*
			* 显示field
			*/
			showTableView.on("change:table", function(tableName){
	          	DataInsightManager.execute("showField", tableName);
	       	});

			/*
			* 打开新建数据表模态框
			* 为避免嵌套，以下事件均绑定到dialogRegion，而不是View
			*/
			DataInsightManager.dialogRegion.on("show:dialog-new-table", function(){
	        	var newTableView = new TableRegion.newTableDialog();
				DataInsightManager.dialogRegion.show(newTableView);
	        });

			/*
			* 打开选择数据库模态框
			*/
	        DataInsightManager.dialogRegion.on("show:dialog-choosed-db", function(){
		        var choosedDbView = new TableRegion.choosedDbDialog();
				DataInsightManager.dialogRegion.show(choosedDbView);
		    });

	        /*
			* 打开导入文件模态框
			*/
		    DataInsightManager.dialogRegion.on("show:dialog-import-file", function(){
		    	var importFileModel = DataInsightManager.request("import-file:entity");
		        var importFileView = new TableRegion.importFileDialog({
		        	model:importFileModel
		        });
				DataInsightManager.dialogRegion.show(importFileView);
		    });

		    /*
			* 打开连接数据库模态框
			*/
		    DataInsightManager.dialogRegion.on("show:dialog-connect-db", function(dbName){
		    	var connectModel = DataInsightManager.request("connect:entity");
		    	connectModel.attributes.kind = dbName;
		        var connectDbView = new TableRegion.connectDbDialog({
		        	model: connectModel
		        });
		        DataInsightManager.dialogRegion.on("connect:error", function(){
					connectDbView.triggerMethod("form:connect:error");
				});
				DataInsightManager.dialogRegion.show(connectDbView);
		    });

		    /*
			* 将导入文件信息传到后台，让后台读取
			*/
		    DataInsightManager.dialogRegion.on("import:db-file", function(model, options){
			   	model.save(options, {
					success: function(model, response, options){
						var collection = DataInsightManager.request("table:entities", response);
						for(var i =0;i<response.length;i++){
					    	response[i].id = (i+1);
					    	response[i].selected = false;
					    	response[i].index = 0;
					    	response[i].choosed = false;
					    }
						DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", collection);
					},
					error: function(model, response, options){
						console.log("连接失败");
					},
				});
		    });

		    /*
			* 根据填入数据库账号密码连接数据库，成功返回表名
			*/
		    DataInsightManager.dialogRegion.on("connect:get-data", function(model, options){
				model.save(options, {
					success: function(model, response, options){
                        if (response.succ) {
                            var respData = response.data;
                            for(var i =0;i<respData.length;i++){
                            	respData[i] = {
                            		'tableName': 	respData[i],
                            		'id': 			(i+1),
                            		'selected': 	false,
                            		'choosed': 		false,
                            		'index': 		0,
                            	}
                            }
                            var collection = DataInsightManager.request("table:entities", respData);
                            DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", collection);
                        } else {
                        }
					},
					error: function(model, response, options){
						DataInsightManager.dialogRegion.trigger("connect:error");
						console.log("连接失败");
					},
				});
			});
				
			/*
			* 打开数据表管理模态框
			*/
		    DataInsightManager.dialogRegion.on("show:dialog-table-manage", function(collection){
				var tableManageView = new TableRegion.tableManageDialog({
					collection: collection
				});
				tableManageView.on("manage:new-table", function(){
	        		DataInsightManager.dialogRegion.trigger("show:dialog-new-table");
	        	});
				DataInsightManager.dialogRegion.show(tableManageView);
		    });

		    /*
			* 显示数据表
			*/
		    DataInsightManager.dialogRegion.on("table:list", function(collection){
		    	DataInsightManager.dialogRegion.$el.modal("hide");
		    	DataInsightManager.trigger('table:list', collection);
		    });

		    /*
			* 设置model属性公用方法
			*/
		    DataInsightManager.dialogRegion.on("model:set", function(model, option){
		    	model.set(option);
		    });

			/*
			* 显示View
			*/
			DataInsightManager.tableRegion.show(showTableView);

			}
		}
	});

	return data;
});
