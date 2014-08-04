/*!
 * 数据表model
 * Date: 2014-7-25
 */
define([], function () {

var data = DataInsightManager.module("Entities",
    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

    //定义Table模型
    Entities.Table = Backbone.Model.extend({
      urlRoot: "table",
    });

    //定义Table集合
    Entities.TableCollection = Backbone.Collection.extend({
      url: "tables",
      model: Entities.Table,
      comparator: 'index',
    });

    //假设测试数据
    var tables;
    var initializeTables = function(options){
      //根据options去获取数据，成功则返回数据，错误返回error,下面是测试数据
      tables = new Entities.TableCollection([
        { id: 1, tableName:'测试数据表1', selected:false, index:0, choosed:false},
        { id: 2, tableName:'测试数据表2', selected:false, index:0, choosed:false},
        { id: 3, tableName:'测试数据表3', selected:false, index:0, choosed:false},
        { id: 4, tableName:'测试数据表4', selected:false, index:0, choosed:false},
        { id: 5, tableName:'测试数据表5', selected:false, index:0, choosed:false},
        { id: 6, tableName:'测试数据表6', selected:false, index:0, choosed:false},
        { id: 7, tableName:'测试数据表7', selected:false, index:0, choosed:false},
        { id: 8, tableName:'测试数据表8', selected:false, index:0, choosed:false},
        { id: 9, tableName:'测试数据表9', selected:false, index:0, choosed:false},
        { id: 10, tableName:'测试数据表10', selected:false, index:0, choosed:false}
      ]);
      
      return tables;
    };

    //定义接口
    var API = {
      //获取表集合
      getTableEntities: function(options){
  /*      var tables = new Entities.TableCollection();
        //考虑数据延迟
        var defer = $.Deferred();
        tables.fetch({
          success: function(data){
            defer.resolve(data);
          }
        });
        return defer.promise();*/

        //测试
        return initializeTables(options);
      },

    };

    //设定request获取
    DataInsightManager.reqres.setHandler("table:entities", function(options){
      return API.getTableEntities(options);
    });
  });

  return data;
});

