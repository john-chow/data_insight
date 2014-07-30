/*!
 * field模板定义
 * Date: 2014-7-28
 */
define([
  "text!region/field/template/region_field.html",
  "text!region/field/template/region_field_item.html",
], function (fieldRegionTemplate, fieldRegionTtemTemplate) {

var data = DataInsightManager.module("FieldRegion",
    function(FieldRegion, DataInsightManager, Backbone, Marionette, $, _){

    //////////////////////////////////////////////////////////定义field的view
    FieldRegion.Field = Marionette.ItemView.extend({
      tagName: "li",
      template: fieldRegionTtemTemplate,
      className: "field-item",
    });

    //////////////////////////////////////////////////////////定义fieldCollection的view
    FieldRegion.Fields = Marionette.CompositeView.extend({
      tagName: "div",
      className: "panel panel-default",
      template: fieldRegionTemplate,
      childView: FieldRegion.Field,
      childViewContainer: "#field_template_content",

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
      },

      /////////////////////////////显示
      onShow: function() {
        var variable = DataInsightManager.fieldRegion.$el.outerHeight()-this.$("#field_template_header").outerHeight()
        this.$("#field_template_content").height(variable);
      },
    });

  });

  return data;
})
