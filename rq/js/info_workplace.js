define([
"jquery"
, "backbone"
, "bootstrap"
, "text!../template/info_workplace.html" 
], function($, Backbone, b, infoWorkplaceHtml) {

    var infoWorkplaceView = Backbone.View.extend({

        tagName:            "div",
        id:                 "info_workplace",

        events: {
            "click .work-book"             :"openWorkBook",
            "click .work-table"             :"openWorkTable",
         
        },

        initialize: function() {
           this.render();
        },

        render: function() {
            this.$el.html(infoWorkplaceHtml);
        },

        //函数里面方法还没考虑多个工作簿和工作表
        openWorkBook: function() {
            $("#show_area").show();
            $("#work_area").hide();
            change_auto();
        },

        openWorkTable: function() {
            $("#show_area").hide();
            $("#work_area").show();
            change_auto();
        }
    });

    return infoWorkplaceView;
})
