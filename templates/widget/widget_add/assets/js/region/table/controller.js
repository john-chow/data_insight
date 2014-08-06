/*!
 * table控制器
 * Date: 2014-7-25
 */
define([
	'entities/table',
	'entities/connectDbForm',
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
		        var importFileView = new TableRegion.importFileDialog();
				DataInsightManager.dialogRegion.show(importFileView);
		    });

		    /*
			* 打开连接数据库模态框
			*/
		    DataInsightManager.dialogRegion.on("show:dialog-connect-db", function(dbName){
		    	var connectModel = DataInsightManager.request("connect:entity");
		    	connectModel.dbName = dbName;
		        var connectDbView = new TableRegion.connectDbDialog({
		        	model: connectModel
		        });
				DataInsightManager.dialogRegion.show(connectDbView);
		    });

		    /*
			* 将导入文件信息传到后台，让后台读取
			*/
		    DataInsightManager.dialogRegion.on("import:db-file", function(options){
			   	$.ajax({
	             	type: "POST",
	             	url: "/XXX",
	             	data: options,
	            	dataType: "json",
	            	success: function(data){
	            		DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", data.collection);
	                }
	          	});
		    });

		    /*
			* 根据填入数据库账号密码连接数据库，成功返回collection
			*/
		    DataInsightManager.dialogRegion.on("connect:get-data", function(model, options){
		    	//返回response的形式，测试数据
		    	var response = [
			        { tableName:'测试数据表1'},
			        { tableName:'测试数据表2'},
			    ]
			    for(var i =0;i<response.length;i++){
			    	response[i].id = (i+1);
			    	response[i].selected = false;
			    	response[i].index = 0;
			    	response[i].choosed = false;
			    }
			    var collection = DataInsightManager.request("table:entities", response);
				DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", collection);
				/*model.save(options, {
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
				});*/
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
