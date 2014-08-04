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
        var self = this;
        var variable = DataInsightManager.fieldRegion.$el.outerHeight()-this.$("#field_template_header").outerHeight()
        this.$("#field_template_content").height(variable);

        this.$(".field-item").draggable({
          connectToSortable: "#x_sortable, #y_sortable",
          helper: "clone",
          scroll: "false",
          zIndex: "3000",
          //revert: "invalid",
          cursor: "default",
          helper: function( event ) {
            return $( "<li class='dragging-field-item'>"+ $(this).html()+"</li>" );
          },
          //所有的回调函数(start, stop, drag)接受两个参数: 浏览器事件和ui对象
          start: function(event,ui) {
            $(".dragging-custom").addClass("dragging-change-border");
          },
          drag: function(event,ui) {
          },
          stop: function(event,ui) {
            $(".dragging-custom").removeClass("dragging-change-border");
          }
        });
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
        //获取信息
        var options=$("#field-manage-form").serialize();
        //中文会被编码，所以需要解码
        options = decodeURIComponent(options,true)
        this.trigger('change:field-attributes', options);
      }

    });
  });

  return data;
})
