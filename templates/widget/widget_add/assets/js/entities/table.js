/*!
 * 数据表model
 * Date: 2014-7-25
 */
define([], function () {

var data = DataInsightManager.module("Entities",
    function(Entities, DataInsightManager, Backbone, Marionette, $, _){

    //////////////////////////////////////////////////////////定义Table模型
    Entities.Table = Backbone.Model.extend({
      urlRoot: "table",
    });

    //////////////////////////////////////////////////////////定义Table集合
    Entities.TableCollection = Backbone.Collection.extend({
      url: "tables",
      model: Entities.Table,
    });

    //////////////////////////////////////////////////////////假设测试数据
    var tables;
    var initializeTables = function(options){
      if(options==undefined){
        tables = new Entities.TableCollection([]);
      }
      else{
        tables = new Entities.TableCollection([
        { id: 1, tableName:'测试数据1'},
        { id: 2, tableName:'测试数据2'},
        { id: 3, tableName:'测试数据3'},
        { id: 4, tableName:'测试数据4'},
        { id: 5, tableName:'测试数据5'},
        { id: 6, tableName:'测试数据6'},
        { id: 7, tableName:'测试数据7'},
        { id: 8, tableName:'测试数据8'},
        { id: 9, tableName:'测试数据9'},
        { id: 10, tableName:'测试数据10'}
      ]);
      }
      
      return tables;
    };

    //////////////////////////////////////////////////////////定义接口
    var API = {
      //获取表集合
      getTableEntities: function(){
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
        return initializeTables();
      },

  /*    //获取单个表
      getTableEntity: function(tableId){
        var table = new Entities.Table({id: tableId});
        var defer = $.Deferred();
        table.fetch({
            success: function(data){
              defer.resolve(data);
            },
            error: function(data){
              defer.resolve(undefined);
            }
          });
        }
        return defer.promise();
      }*/
    };

    //////////////////////////////////////////////////////////设定request获取
    DataInsightManager.reqres.setHandler("table:entities", function(){
      return API.getTableEntities();
    });

  /*  DataInsightManager.reqres.setHandler("table:entity", function(id){
      return API.getTableEntity(id);
    });*/
  });

  return data;
});

