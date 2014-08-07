/*!
 * 参数model
 * Date: 2014-7-28
 */
define([], function () {

var data = DataInsightManager.module("Entities",
    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

    //定义Field模型
    Entities.Field = Backbone.Model.extend({
      urlRoot: "/field",
    });

    //定义Field集合
    Entities.FieldCollection = Backbone.Collection.extend({
      url: "/fields",
      model: Entities.Field,
    });

    //假设测试数据
    var fields;
    var initializeFields = function(tableName){
      if(tableName==undefined){
        fields = new Entities.FieldCollection([]);
      }
      else{
        //fields.fetch({'data': {'table': tableName}});
        //测试数据
          fields = new Entities.FieldCollection([
            { fieldName:'字段1', type:"F", nickName:"备注名1"},
            { fieldName:'字段2', type:"F", nickName:""},
            { fieldName:'字段3', type:"D", nickName:""},
            { fieldName:'字段4', type:"N", nickName:""},
            { fieldName:'字段5', type:"N", nickName:"备注名2"},
            { fieldName:'字段6', type:"D", nickName:""},
            { fieldName:'字段7', type:"T", nickName:""},
            { fieldName:'字段8', type:"F", nickName:""},
            { fieldName:'字段9', type:"F", nickName:""},
            { fieldName:'字段10', type:"N", nickName:""}
          ]);
      }
      
      return fields;
    };

    //定义接口
    var API = {
      //获取表集合
      getFieldEntities: function(tableName){
        //测试
        return initializeFields(tableName);
      },
    };

    //设定request获取
    DataInsightManager.reqres.setHandler("field:entities", function(tableName){
      return API.getFieldEntities(tableName);
    });
  });

  return data;
});

