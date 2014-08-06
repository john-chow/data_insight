/*!
 * 数据表model
 * Date: 2014-7-25
 */
define([], function () {

var data = DataInsightManager.module("Entities",
    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

    //定义Table模型
    Entities.Table = Backbone.Model.extend({
      urlRoot: "/table",
    });

    //定义Table集合
    Entities.TableCollection = Backbone.Collection.extend({
      url: "/tables",
      model: Entities.Table,
      comparator: 'index',
    });

    //定义接口
    var API = {
      getTableEntities: function(data){
        var tables = new Entities.TableCollection(data)
        return tables;
      },
    };

    DataInsightManager.reqres.setHandler("table:entities", function(data){
      return API.getTableEntities(data);
    });

  });

  return data;
});

