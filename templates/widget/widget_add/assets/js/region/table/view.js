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

    /*
    * 定义table的view
    */
    TableRegion.TableView = Marionette.ItemView.extend({
      tagName: "div",
      className: "panel panel-default",
      template: tableRegionTemplate,

      events: {
         "click .table-item": "changeSelectTable",
      },

      triggers: {
          "click #table_template_header>span": "show:new-table",
      },

      onShow: function() {
        var variable, selectedCollection, choosedModel;

        //设置高度
        variable = DataInsightManager.tableRegion.$el.outerHeight()-this.$("#table_template_header").outerHeight()
        this.$("#table_template_content").height(variable);

        //三种不同情况下显示数据表（无数据，有数据有选中表，有数据无选中表）
        selectedCollection = this.collection.where({selected:true});
        if(selectedCollection.length > 0){
          choosedModel = this.collection.findWhere({choosed:true});
          if(choosedModel){
              this.trigger("change:table", choosedModel.get("tableName"));
          }
          else{
            this.$(".table-item").eq(0).addClass("table-item-choosed");
            DataInsightManager.dialogRegion.trigger('model:set', selectedCollection[0], {"choosed":true});
            this.trigger("change:table", selectedCollection[0].get("tableName"));
          }
        }
        else{
          this.trigger("change:table");
        }
      },

      //定义切换数据表事件
      changeSelectTable: function(e){
        this.$(".table-item-choosed").removeClass("table-item-choosed");
        $(e.target).addClass("table-item-choosed");

        var choosedModel = this.collection.findWhere({choosed:true});
        DataInsightManager.dialogRegion.trigger('model:set', choosedModel, {"choosed":false});
        
        var id = $(e.target).attr("data-id");
        DataInsightManager.dialogRegion.trigger('model:set', this.collection.get(id), {"choosed":true});
        
        this.trigger("change:table", id);
      },

    });

    /*
    * 定义diaglog_new_table模板
    */
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

    /*
    * 定义diaglog_choosed-db模板
    */
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

    /*
    * 定义diaglog_connect-db模板
    */
    TableRegion.connectDbDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: connectDbTemplate,
      events: {
        "click .connect-db-commit": "managetableFunction",
      }, 
      managetableFunction: function(){
        this.$(".connect-db-commit").html("连接中...");
        var options = {
            "ip":     this.$("#connect_ip").val(),
            "port":   this.$("#connect_port").val(),
            "db":     this.$("#connect_db").val(),
            "user":   this.$("#connect_user").val(),
            "pwd":    this.$("#connect_pwd").val()
        };
        DataInsightManager.dialogRegion.trigger('connect:get-data', this.model, options);
      },
    });

    /*
    * 定义diaglog_import-file模板
    */
    TableRegion.importFileDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: importFileTemplate,
      events: {
        "click .import-file-commit": "managetableFunction",
      }, 
      managetableFunction: function(){
        var options={
          filePath:       this.$("#import_file_name").val(),
          dbType:         this.$("#import_file_type").val(),
          characteType:   this.$("#import_file_characte").val()
        }
        DataInsightManager.dialogRegion.trigger('import:db-file', options);
      },
    });

    /*
    * 定义diaglog_table-manage模板
    */
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
        var self = this;
        this.$(".table-manage-select select option").each(function(i){
            var model =self.collection.get($(this).val());
            DataInsightManager.dialogRegion.trigger('model:set', model, {"index":(i+1)});
          });
        this.collection.sort();
        DataInsightManager.dialogRegion.trigger('table:list',this.collection);
      },

      choosedTableFunction: function(){
          var self = this;
          this.$(".table-manage-unselect select option:selected").each(function(){
            self.$(".table-manage-select select").append(this);
            var model = self.collection.get($(this).val());
            DataInsightManager.dialogRegion.trigger('model:set', model, {"selected":true});
          });
      },
      
      unchoosedTableFunction: function(){
          var self = this;
          this.$(".table-manage-select select option:selected").each(function(){
            self.$(".table-manage-unselect select").append(this);
            var model = self.collection.get($(this).val());
            DataInsightManager.dialogRegion.trigger('model:set', model, {
              "selected":false,
              "choosed":false,
              "index":0,
            });
          });
      }
    });

  });

  return data;
})
