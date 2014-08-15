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
          "click #table_template_header>span": "show:table-dialog",
      },

      onShow: function() {
        var variable, selectedModelList, choosedModel;

        //设置高度
        variable = DataInsightManager.tableRegion.$el.outerHeight()-this.$("#table_template_header").outerHeight()
        this.$("#table_template_content").height(variable);

        //三种不同情况下显示数据表（无数据，有数据有选中表，有数据无选中表）
        selectedModelList = this.collection.where({selected:true});
        if(selectedModelList.length > 0){
          choosedModel = this.collection.findWhere({choosed:true});
          if(!choosedModel){
            this.$(".table-item").eq(0).addClass("table-item-choosed");
          }
          DataInsightManager.dialogRegion.trigger('pass:selected-table', selectedModelList);
        }
        else{
          DataInsightManager.dialogRegion.trigger("change:fields", []);
          DataInsightManager.dialogRegion.$el.modal("hide");
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

        var model = this.collection.get(id)
        var fields = model.get("fields");
        var tableName = model.get("tableName");

        DataInsightManager.dialogRegion.trigger("change:fields", fields, tableName);
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
      connectDbFunction: function(e){
        var kind = $(e.target).attr("data-name")
        DataInsightManager.dialogRegion.trigger('show:dialog-connect-db', kind);
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
        "click button": "unbindFunction"
      }, 
      onShow: function(){
        $(document).bind("keydown", this.keyDownFunction);
      },

      keyDownFunction: function(ev){
        if(ev.keyCode==13 && $(".connect-db-commit")[0] 
            && $("#dialog_region").css("display") == "block"){
            $(".connect-db-commit").click();
          };
      },

      unbindFunction: function(ev){
        if($(ev.currentTarget).attr("data-dismiss")=="modal")
          $(document).unbind("keydown", this.keyDownFunction);
      },
      
      managetableFunction: function(){
        $(document).unbind("keydown", this.keyDownFunction);
        var options = {
            "ip":     this.$("#connect_ip").val(),
            "port":   this.$("#connect_port").val(),
            "db":     this.$("#connect_db").val(),
            "user":   this.$("#connect_user").val(),
            "pwd":    this.$("#connect_pwd").val()
        };
        this.$(".connect-db-commit").html("连接中...");
        this.$(".connect-db-commit").css("cursor","wait");
        DataInsightManager.dialogRegion.trigger('connect:get-data', this.model, options);
      },

      onFormConnectError: function(){
        $(document).bind("keydown", this.keyFunction);
        this.$(".connect-db-commit").html("确定");
        this.$(".connect-db-commit").css("cursor","pointer");
        this.$("#connect_error").show();
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
        this.$(".import-file-commit").html("导入中...");
        this.$(".import-file-commit").css("cursor","wait");
        var options={
          "type":   this.$("#import_file_type").val(),
          "attr":   this.$("#import_file_attr").val(),
          "code":   this.$("#import_file_code").val()
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
        "click #table_manage_ul>li":    "toggleCheckedFunction",
        "click .table-manage-all": 		"selectAllFunction",
        "click .table-manage-none": 	"selectNoneFunction",
      }, 

      tableListFunction: function(){
      	this.$(".table-manage-commit").html("加载中...");
        this.$(".table-manage-commit").css("cursor","wait");
        var self = this;
        this.$("[name='manageCheckbox']").each(function(){
          var model = self.collection.get($(this).attr("data-id"));
          if($(this).attr("checked")){
            DataInsightManager.dialogRegion.trigger('model:set', model, {"selected":true});
          }
          else {
            DataInsightManager.dialogRegion.trigger('model:set', model, {"selected":false,"choosed":false});
          }
        })
        DataInsightManager.dialogRegion.trigger('table:list', this.collection);
      },

      toggleCheckedFunction: function(ev){
    			if($(ev.currentTarget).find("input").attr("checked")) {
    				$(ev.currentTarget).find("input").removeAttr("checked"); 
    			}
    			else {
    				$(ev.currentTarget).find("input").attr("checked",true).prop('checked',true); 
    			}
      },

      selectAllFunction: function(){
        this.$("[name='manageCheckbox']").attr("checked",'true').prop('checked',true);
      },

      selectNoneFunction: function(){
        this.$("[name='manageCheckbox']").removeAttr("checked");
      },
			
    });

  });

  return data;
})
