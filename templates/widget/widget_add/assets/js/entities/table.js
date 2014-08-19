/*!
 * 数据表model
 * Date: 2014-7-25
 */
define([], function () {

var data = DataInsightManager.module("Entities",
    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

    //定义Table模型
    Entities.Table = Backbone.Model.extend({
      defaults: {
        id: "",
        tableName: "", 
        fields: [],  //字段
        selected: "", //数据管理中选择的表格（可多个）
        choosed: "", //显示表区域中选中的表格（一个）
      },
      urlRoot: "/table",
    });

    //定义Table集合
    Entities.TableCollection = Backbone.Collection.extend({
      url: "/widget/usedtb/" + window.widgetId + "/",
      model: Entities.Table,
    });

    //定义接口
    var API = {
      getTableEntities: function(data){
      	var tables;
      	if(data){
        	tables = new Entities.TableCollection(data);
        }
        else{
        	tables = new Entities.TableCollection();
	        tables.fetch({
	        	type: "get",
	        	cache: false,
		        async: false,
	        	data: {
	        		"widgetId":widgetId,
	        	},
				success: function(collection, respose){
					if(respose.succ){
						var modelList = [], allTableName = respose.all;
                        for(var i =0;i<allTableName.length;i++){
                            modelList[i] = {
                            		'tableName': 	allTableName[i],
                            		'id': 			(i+1),
                            }
                            if(i==0){
                            	modelList[i].choosed = true;
                            }
                            else{
                            	modelList[i].choosed = false;
                            }
                            if($.inArray(respose.selected[i], respose.all) == -1){
                            	modelList[i].selected = false;
                            }
                            else{
                            	modelList[i].selected = true;
                            }
                        }
                        tables = new Entities.TableCollection(modelList);
					}
					else{
						console.log("table实体恢复出错! table.js");
					}
				},
	        })
        }
        return tables;
      },
    };

    //通过数据集合获取table集合
    DataInsightManager.reqres.setHandler("table:entities", function(data){
      return API.getTableEntities(data);
    });

  });

  return data;
});

