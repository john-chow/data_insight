/*!
 * field模板定义
 * Date: 2014-7-28
 */
define([
  "text!region/field/template/region_field.html",
  "text!region/field/template/dialog_field_manage.html"
], function (fieldRegionTemplate, fieldManageTemplate) {

var data = DataInsightManager.module("FieldRegion",
    function(FieldRegion, DataInsightManager, Backbone, Marionette, $, _){

    //////////////////////////////////////////////////////////定义field的view
    FieldRegion.FieldView = Marionette.ItemView.extend({
      tagName: "div",
      className: "panel panel-default",
      template: fieldRegionTemplate,

      triggers: {
          "click #field_template_header>span": "show:manage-dialog",
      },

      /////////////////////////////显示
      onShow: function() {
        var variable = DataInsightManager.fieldRegion.$el.outerHeight()-this.$("#field_template_header").outerHeight()
        this.$("#field_template_content").height(variable);
      },
    });

    //定义dialog_field_manage模板
    FieldRegion.FieldManageDialog = Marionette.ItemView.extend({
      tagName: "div",
      className: "modal-dialog",
      template: fieldManageTemplate,

      events: { 
          "mouseenter .field-manage-content>ul": "showBackgroundColorFunction",
          "mouseleave .field-manage-content>ul": "hideBackgroundColorFunction",
          "click .field-manage-commit":          "fieldManageCommitFunction"
      }, 

      showBackgroundColorFunction: function(e){
        $(e.currentTarget).addClass('field-manage-color');
      },

      hideBackgroundColorFunction: function(e){
        $(e.currentTarget).removeClass('field-manage-color');
      },

      fieldManageCommitFunction: function(e){
        //获取信息，假设已经获取
        var options={};
        this.trigger('change:nickName', options);
      }

    });
  });

  return data;
})
