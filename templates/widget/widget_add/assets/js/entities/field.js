/*!
 * 参数model
 * Date: 2014-7-28
 */
define([], function () {

var data = DataInsightManager.module("Entities",
    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

    //定义Field模型
    Entities.Field = Backbone.Model.extend({
      urlRoot: "field",
    });

    //定义Field集合
    Entities.FieldCollection = Backbone.Collection.extend({
      url: "fields",
      model: Entities.Field,
    });

    //假设测试数据
    var fields;
    var initializeFields = function(id){
      if(id==undefined){
        fields = new Entities.FieldCollection([]);
      }
      else{
        //测试数据，此处应该根据id获取字段，下面是测试数据
        if(id%3 == 0){
          fields = new Entities.FieldCollection([
            { id: 1, fieldName:'字段1', type:"F", nickName:"备注名1"},
            { id: 2, fieldName:'字段2', type:"F", nickName:""},
            { id: 3, fieldName:'字段3', type:"D", nickName:""},
            { id: 4, fieldName:'字段4', type:"N", nickName:""},
            { id: 5, fieldName:'字段5', type:"N", nickName:"备注名2"},
            { id: 6, fieldName:'字段6', type:"D", nickName:""},
            { id: 7, fieldName:'字段7', type:"T", nickName:""},
            { id: 8, fieldName:'字段8', type:"F", nickName:""},
            { id: 9, fieldName:'字段9', type:"F", nickName:""},
            { id: 10, fieldName:'字段10', type:"N", nickName:""}
          ]);
        }
        else if(id%3 == 1){
          fields = new Entities.FieldCollection([
            { id: 1, fieldName:'字段1', type:"F", nickName:""},
            { id: 2, fieldName:'字段2', type:"F", nickName:""},
            { id: 3, fieldName:'字段3', type:"N", nickName:"备注名2"},
            { id: 4, fieldName:'字段4', type:"N", nickName:""}
          ]);
        }
        else {
          fields = new Entities.FieldCollection([
            { id: 1, fieldName:'字段6', type:"D", nickName:""},
            { id: 2, fieldName:'字段7', type:"F", nickName:""},
            { id: 3, fieldName:'字段8', type:"F", nickName:""},
            { id: 4, fieldName:'字段9', type:"N", nickName:"备注名1"},
            { id: 8, fieldName:'字段8', type:"N", nickName:"备注名2"},
            { id: 9, fieldName:'字段9', type:"N", nickName:""},
            { id: 5, fieldName:'字段5', type:"N", nickName:""}
          ]);
        }
      }
      
      return fields;
    };

    //定义接口
    var API = {
      //获取表集合
      getFieldEntities: function(id){
        //测试
        return initializeFields(id);
      },
    };

    //设定request获取
    DataInsightManager.reqres.setHandler("field:entities", function(id){
      return API.getFieldEntities(id);
    });
  });

  return data;
});

