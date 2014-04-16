define([
"jquery"
, "backbone"
, "bootstrap"
, "gridster"
, "text!../template/info_workplace.html" 
], function($, Backbone, b, g, infoWorkplaceHtml) {

    var infoWorkplaceView = Backbone.View.extend({

        tagName:            "div",
        id:                 "info_workplace",

        events: {
            "click .work-book"             :"openWorkBook",
            "click .work-table"             :"openWorkTable",
         
        },

        initialize: function() {
           this.render();
           this.gridsterInit();
        },

        render: function() {
            this.$el.html(infoWorkplaceHtml);
        },

        gridsterInit: function() {
             Backbone.Events.once("gridster:init", function(data) {
                 //流动布局
                gridster = $(".gridster ul").gridster({
                  //widget_selector: "li",                        //确定哪个元素是widget
                  widget_margins: [5, 5],                       //margin大小
                  widget_base_dimensions: [140, 140],           //面积大小
                  helper:'clone',
                  autogrow_cols: true,
                  resize:{
                    enabled: true
                  },
                }).data('gridster');
            });
        },

        //函数里面方法还没考虑多个工作簿和工作表
        openWorkBook: function() {
            $("#show_area").show();
            $("#work_area").hide();
            change_auto();
            Backbone.Events.trigger("gridster:init", "");
            
        },

        openWorkTable: function() {
            $("#show_area").hide();
            $("#work_area").show();
            change_auto();
        }
    });

    return infoWorkplaceView;
})
