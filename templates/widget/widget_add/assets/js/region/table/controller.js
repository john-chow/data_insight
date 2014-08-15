/*!
 * table控制器
 * Date: 2014-7-25
 */
define([
	'entities/table',
	'entities/connectDbForm',
	'region/table/view',
	'ajaxfileupload'
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
				showTableView.on("show:table-dialog", function(){
					DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", collection);
	       		});
			}
			else{
				showTableView = new TableRegion.TableView({
					collection: new (Backbone.Collection.extend({}))
				});
				showTableView.on("show:table-dialog", function(){
					DataInsightManager.dialogRegion.trigger("show:dialog-new-table");
				});
			}

			/*
			* 为避免嵌套，以下事件均绑定到dialogRegion，而不是View
			* 防止重复绑定
			*/
			DataInsightManager.dialogRegion.off();

			/*
			* 显示field
			*/
			DataInsightManager.dialogRegion.on("change:fields", function(fields, tableName){
	          	DataInsightManager.execute("showField", fields, tableName);
	       	});

			/*
			* 打开新建数据表模态框
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
			   	/*model.save(options, {
					success: function(model, response, options){
						var collection = DataInsightManager.request("table:entities", response);
						for(var i =0;i<response.length;i++){
					    	response[i].id = (i+1);
					    	response[i].selected = false;
					    	response[i].choosed = false;
					    }
						DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", collection);
					},
					error: function(model, response, options){
						console.log("连接失败");
					},
				});*/
		        $.ajaxFileUpload({
			        url: '/connect/file/',
			        secureuri: false,
			        type: "post",
			        data: options,
			        fileElementId: 'importfile',
			        dataType: 'json',
			        success: function (data) {
			            alert(data.msg);
			        },
			        error: function (data) {
			            alert("error");
			        }
			    });
		    });

		    /*
			* 根据填入数据库账号密码连接数据库，成功返回表名
			*/
		    DataInsightManager.dialogRegion.on("connect:get-data", function(model, options){
				if(!model.save(options, {
					success: function(model, response, options){
                        if (response.succ) {
                            var respData = response.data;
                            for(var i =0;i<respData.length;i++){
                            	respData[i] = {
                            		'tableName': 	respData[i],
                            		'id': 			(i+1),
                            		'selected': 	false,
                            		'choosed': 		false,
                            	}
                            }
                            var collection = DataInsightManager.request("table:entities", respData);
                            DataInsightManager.dialogRegion.trigger("show:dialog-table-manage", collection);
                        }
                        else{
                            DataInsightManager.dialogRegion.trigger("connect:error");
							console.log("连接失败");
                        }
					}
				})){
					DataInsightManager.dialogRegion.trigger("connect:error");
					console.log("连接失败");
				}
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
			* 传送已经选择的表名到后台，返回fields
			*/
		    DataInsightManager.dialogRegion.on("pass:selected-table", function(selectedModelList){
		    	var selectedNameList=[], i, j, backDataList, tempData;
		    	for(i =0; i<selectedModelList.length; i++){
		    		selectedNameList[i] = selectedModelList[i].attributes.tableName;
		    	}
		    	$.ajax({
		             	type: "POST",
		             	cache: false,
		             	async: false,
		             	url: "/connect/table/",
		             	data: {
		             		'table': JSON.stringify(selectedNameList)
		            	},
		            	dataType: "json",
		            	success: function(data){
		            		if(data.succ)
		            			backDataList = JSON.parse(data.data);
		                }
		        });
		        //把数据放入model
		        for(i=0 ; i<backDataList.length; i++){
		        	var selectedModelList = collection.where({selected:true});
		        	tempData = [];
		        	for(j=0 ; j<backDataList[i].fields.length; j++){
		        		tempData[j]={
		        			"fieldName": backDataList[i].fields[j],
		        			"type": backDataList[i].types[j],
		        			"nickName": backDataList[i].nicknames[j],
		        			"id": j
		        		}
		        	}
		        	if(i==0 && !collection.findWhere({"choosed":true})){
		        		selectedModelList[i].set({"choosed": true, "fields": tempData});
		        	}
		        	else{
		        		selectedModelList[i].set({"fields": tempData});
		        	}
		        }
		        tempData = collection.findWhere({"choosed":true});
		        DataInsightManager.dialogRegion.trigger("change:fields", tempData.get("fields"), tempData.get("tableName"));
		        DataInsightManager.dialogRegion.$el.modal("hide");
		    });

		    /*
			* 显示数据表
			*/
		    DataInsightManager.dialogRegion.on("table:list", function(collection){
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
