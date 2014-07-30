/*!
 * table模板定义
 * Date: 2014-7-25
 */
define([
  "text!region/table/template/region_table.html",
  "text!region/table/template/region_table_item.html",
  "text!region/table/template/dialog_new_table.html",
  "text!region/table/template/dialog_choosed_db.html",
  "text!region/table/template/dialog_import_file.html"
], function (tableRegionTemplate, tableRegionTtemTemplate, newTableTemplate, choosedDbTemplate, importFileTemplate) {

var data = DataInsightManager.module("TableRegion",
    function(TableRegion, DataInsightManager, Backbone, Marionette, $, _){

    //定义table的view
    TableRegion.Table = Marionette.ItemView.extend({
      tagName: "li",
      template: tableRegionTtemTemplate,
      className: "table-item",

      //注册事件
      events: {
         "click": "changeSelectTable",
      },

      //定义事件
      changeSelectTable: function(e){
        this.$el.siblings(".table-item-select").removeClass("table-item-select");
        $(e.target).addClass("table-item-select");
        this.trigger("change:table",this.model);
      },

    });

    //定义tableCollection的view
    TableRegion.Tables = Marionette.CompositeView.extend({
      tagName: "div",
      className: "panel panel-default",
      template: tableRegionTemplate,
      childView: TableRegion.Table,
      childViewContainer: "#table_template_content",

      //触发器
      triggers: {
          "click #table_template_header>span": "show:dialog-new-table",
      },
     
      //初始化
      initialize: function(){
        this.listenTo(this.collection, "reset", function(){
          this.attachHtml = function(collectionView, childView, index){
            collectionView.$el.append(childView.el);
          }
        });
      },

      //渲染
      onRenderCollection: function(){
        this.attachHtml = function(collectionView, childView, index){
          collectionView.$el.prepend(childView.el);
        }
      },

      //显示
      onShow: function() {
        var variable = DataInsightManager.tableRegion.$el.outerHeight()-this.$("#table_template_header").outerHeight()
        this.$("#table_template_content").height(variable);
        this.$(".table-item").eq(0).addClass("table-item-select");
        if(this.collection.length > 0)
          this.trigger('table:init', this.collection);
      },

    });

    //定义diaglog_new_table模板
    TableRegion.newTableDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: newTableTemplate,

      triggers: {
          //"click .dialog-new-table-db": "show:dialog-choosed-db",
          //"click .dialog-new-table-file": "show:dialog-import-file",
      },

      events: {
        "click .dialog-new-table-db": "newTabelDbFunction",
        "click .dialog-new-table-file": "newTableFileFunction",
      }, 

      newTabelDbFunction: function(){
        DataInsightManager.dialogRegion.trigger('show:dialog-choosed-db');
      },

      newTableFileFunction: function(){
        DataInsightManager.dialogRegion.trigger('show:dialog-import-file');
      },

    });



    //定义diaglog_choosed-db模板
    TableRegion.choosedDbDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: choosedDbTemplate,

    });

    //定义diaglog_import-file模板
    TableRegion.importFileDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: importFileTemplate,

    });

  });

  return data;
})
