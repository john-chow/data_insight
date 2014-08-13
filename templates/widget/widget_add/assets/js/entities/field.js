/*!
 * 参数model
 * Date: 2014-7-28
 */
define(['jquery'], function ($) {

var data = DataInsightManager.module("Entities",
    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

    //定义Field模型
    Entities.Field = Backbone.Model.extend({
      defaults: {
        fieldName: "",
        type: "",
        nickName: "",
      }
    });

    //定义Field集合
    Entities.FieldCollection = Backbone.Collection.extend({
      url: "/connect/field",
      model: Entities.Field,
    });

    //定义接口
    var API = {
      //获取表集合
      getFieldEntities: function(fields){

/*        var fields;
        var defer = $.Deferred();
        fields = new Entities.FieldCollection();
        if(tableName==undefined){
          defer.resolve(fields);
        }
        else{
          fields.fetch({'data': {'table': tableName},
            success: function(collection, response, options){
              var i, backObject, arrList = [], len;
              backObject = JSON.parse(response.data);
              len = backObject.fields.length;
              for(i = 0; i < len; i++){
                arrList[i]={
                  "fieldName": backObject.fields[i],
                  "type": backObject.types[i],
                  "nickName": backObject.nicknames[i],
                }
              }
              fields = new Entities.FieldCollection(arrList);
              defer.resolve(fields);
            },
            error: function(collection, response, options){
              console.log("获取field失败");
            },
          });
        }
        return defer.promise();*/
        return new Entities.FieldCollection(fields);
      }
    };

    //设定request获取
    DataInsightManager.reqres.setHandler("field:entities", function(fields){
      return API.getFieldEntities(fields);
    });
  });

  return data;
});

