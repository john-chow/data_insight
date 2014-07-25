/*!
 * table模板定义
 * Date: 2014-7-25
 */
define([
  "text!region/table/template/region_table.html",
  "text!region/table/template/region_table_item.html",
  "text!region/table/template/dialog_new_table.html"
], function (tableRegionTemplate, tableRegionTtemTemplate, tableEditDialogTemplate) {

var data = DataInsightManager.module("TableApp",
    function(TableApp, DataInsightManager, Backbone, Marionette, $, _){

    //////////////////////////////////////////////////////////定义table的view
    TableApp.Table = Marionette.ItemView.extend({
      tagName: "li",
      template: tableRegionTtemTemplate,
      className: "table-item",

      /////////////////////////////触发器
      triggers: {
      },

      /////////////////////////////注册事件
      events: {
      },

      /////////////////////////////定义事件
      testFcuntion: function(e){

      },
    });

    //////////////////////////////////////////////////////////定义tableCollection的view
    TableApp.Tables = Marionette.CompositeView.extend({
      tagName: "div",
      className: "",
      template: tableRegionTemplate,
      childView: TableApp.Table,
      childViewContainer: "#table_template_content ul",

      /////////////////////////////初始化
      initialize: function(){
        this.listenTo(this.collection, "reset", function(){
          this.attachHtml = function(collectionView, childView, index){
            collectionView.$el.append(childView.el);
          }
        });
      },

      /////////////////////////////渲染
      onRenderCollection: function(){
        this.attachHtml = function(collectionView, childView, index){
          collectionView.$el.prepend(childView.el);
        }
      }
    });

    //////////////////////////////////////////////////////////定义table编辑的dialog
    TableApp.Dialog = Marionette.ItemView.extend({
      tagName: "div",
      template: tableEditDialogTemplate,
    });

  });

  return data;
})
