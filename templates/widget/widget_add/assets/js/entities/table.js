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
      url: "/tables",
      model: Entities.Table,
    });

    //定义接口
    var API = {
      tables: 	null,

      getTableEntities: function(data){
      	if(data){
        	this.tables = new Entities.TableCollection(data);
        }
        else{
        	this.tables = new Entities.TableCollection();
	        this.tables.fetch({
	        	type: "get",
	        	cache: false,
		        async: false,
	        	data: {
	        		"widgetId":widgetId,
	        	},
				success: function(collection, respose){
				},
	        })
        }

        return this.tables;
      },

      getTableInfoData: function(){
        	var selectModels = this.tables.where({"selected":true});
        	var chooseModel = this.tables.findWhere({"choosed":true}) || selectModels[0];
        	var tableNameList = [];
        	for(var i=0;i<selectModels.length;i++){
        		tableNameList[i] = selectModels[i].attributes.tableName;
        	}
        	return {
        		"selectNames": tableNameList,
        		"chooseName": chooseModel.attributes.tableName,
        	}
    	}
    };

    //通过数据集合获取table集合
    DataInsightManager.reqres.setHandler("table:entities", function(data){
      return API.getTableEntities(data);
    });

    DataInsightManager.reqres.setHandler("table:infoData", function(){
      return API.getTableInfoData();
    });

  });

  return data;
});

