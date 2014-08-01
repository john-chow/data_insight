/*!
 * table模板定义
 * Date: 2014-7-25
 */
define([
  "text!region/table/template/region_table.html",
  "text!region/table/template/dialog_new_table.html",
  "text!region/table/template/dialog_choosed_db.html",
  "text!region/table/template/dialog_import_file.html",
  "text!region/table/template/dialog_connect_db.html",
  "text!region/table/template/dialog_table_manage.html"
], function (tableRegionTemplate,newTableTemplate,choosedDbTemplate,
 importFileTemplate, connectDbTemplate, tableManageTemplate) {

var data = DataInsightManager.module("TableRegion",
    function(TableRegion, DataInsightManager, Backbone, Marionette, $, _){

    //定义table的view
    TableRegion.TableView = Marionette.ItemView.extend({
      tagName: "div",
      className: "panel panel-default",
      template: tableRegionTemplate,
      //注册事件
      events: {
         "click .table-item": "changeSelectTable",
      },
      //触发器
      triggers: {
          "click #table_template_header>span": "show:new-table",
      },
      //显示
      onShow: function() {
        var id, i, variable, selectedCollection;
        variable = DataInsightManager.tableRegion.$el.outerHeight()-this.$("#table_template_header").outerHeight()
        this.$("#table_template_content").height(variable);
        selectedCollection = this.collection.where({selected:true});
        if(selectedCollection.length > 0){
          this.$(".table-item").eq(0).addClass("table-item-select");
          this.trigger("change:table", selectedCollection[0].get("id"));
        }
        else{
          this.trigger("change:table");
        }
      },
      //定义事件
      changeSelectTable: function(e){
        this.$(".table-item-select").removeClass("table-item-select");
        $(e.target).addClass("table-item-select");
        this.trigger("change:table", $(e.target).attr("data-id"));
      },

    });

    //定义diaglog_new_table模板
    TableRegion.newTableDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: newTableTemplate,

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
      events: {
        "click .choosed-db-new>li": "connectDbFunction",
      }, 
      connectDbFunction: function(){
        DataInsightManager.dialogRegion.trigger('show:dialog-connect-db');
      },
    });

    //定义diaglog_connect-db模板
    TableRegion.connectDbDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: connectDbTemplate,
      events: {
        "click .connect-db-commit": "managetableFunction",
      }, 
      managetableFunction: function(){
        //根据表单信息
        var options= {
          "ip":     "127.0.0.1",
          "port":   "5432",
          "db":     "postgres",
          "user":   "postgres",
          "pwd":    "123456"
        };
        DataInsightManager.dialogRegion.trigger('show:dialog-table-manage', options);
      },
    });

    //定义diaglog_import-file模板
    TableRegion.importFileDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: importFileTemplate,
      events: {
        "click .import-file-commit": "managetableFunction",
      }, 
      managetableFunction: function(){
        var options={
          filePath: this.$("#import_file_name").val(),
          dbType: this.$("#import_file_type").val(),
          characteType:this.$("#import_file_characte").val()
        }
        DataInsightManager.dialogRegion.trigger('import:db-file', options);
      },
    });

    //定义diaglog_table-manage模板
    TableRegion.tableManageDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: tableManageTemplate,

      triggers: {
         "click #table_manage_new>a": "manage:new-table"
      },

      events: {
        "click .table-manage-commit":     "tableListFunction",
        "click #table_manage_choosed":    "choosedTableFunction",
        "click #table_manage_unchoosed":  "unchoosedTableFunction"
      }, 
      tableListFunction: function(){
        DataInsightManager.dialogRegion.trigger('table:list',this.collection);
      },
      choosedTableFunction: function(){
          var self = this;
          this.$(".table-manage-unselect select option:selected").each(function(){
            self.$(".table-manage-select select").append(this);
            self.collection.get($(this).val()).set("selected", true);
          });
      },
      unchoosedTableFunction: function(){
          var self = this;
          this.$(".table-manage-select select option:selected").each(function(){
            self.$(".table-manage-unselect select").append(this);
            self.collection.get($(this).val()).set("selected", false);
          });
      }
    });

  });

  return data;
})
