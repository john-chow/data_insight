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
      defaults: {
        id:"",
        tableZindex:"",
        tableItem:"" //表顺序
      },
    });

    //////////////////////////////////////////////////////////定义Table集合
    Entities.TableCollection = Backbone.Collection.extend({
      url: "tables",
      model: Entities.Table,
    });

    //////////////////////////////////////////////////////////假设测试数据
    var tables;
    var initializeTables = function(){
      tables = new Entities.TableCollection([
        { id: 1,tableZindex:'1',tableItem:'数据1'},
        { id: 2,tableZindex:'2',tableItem:'数据2'}
      ]);
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

