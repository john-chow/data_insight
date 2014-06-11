/*简单的工具视图，主要作用是监听添加/编辑组件页按钮的事件*/
define([
 "backbone"
, "jqueryUi"
], function(Backbone, x) {

    var ToobarView = Backbone.View.extend({
        el: "div#toolbar",

        events: {
             "click #toolbar_ico_minus":       "minusCanvas"
            , "click #toolbar_ico_plus":        "plusCanvas"
            , "click #toolbar_save":            function() {
                //触发自定义事件center:save_args
                VtronEvents.triggerOut("center:save_args")
            }
            , "click #toolbar_save_and_back":       function() {
                Backbone.Events.trigger("center:save_args_and_back")
            }
            ,"click #design_menu_back":             "backToWidgetList"
        },
        initialize: function(){
            this.$el.append($('<div class="btn-group btn-group-md"><button id="toolbar_save" type="button" class="btn btn-sm btn-default"><span class="glyphicon glyphicon-floppy-save"></span>&nbsp;保存</button>' +
            '<button id="design_menu_back" type="button" class="btn btn-sm btn-default"><span class="glyphicon glyphicon-refresh"> </span>&nbsp;返回</button></div>' +
            '<div class="btn-group btn-group-md" style="margin-left: 15px;"><button id="toolbar_ico_plus" type="button" class="btn btn-sm btn-default"><span class="glyphicon glyphicon-zoom-in"> </span>&nbsp;放大</button>'  +
            '<button id="toolbar_ico_minus" type="button" class="btn btn-sm btn-default"><span class="glyphicon glyphicon-zoom-out"> </span>&nbsp;缩小</button></button></div>'));
            this.$el.draggable({
                scroll: "false"
            });
        },
        minusCanvas: function() {
            $("#draw_panel canvas ,#draw_panel div, #draw_panel textarea").each(function(){
                    var newWidth = ($(this).width())*0.9;
                    $(this).width(newWidth);
                    var newHeight = ($(this).height())*0.9;
                    $(this).height(newHeight);
                });
        },

        plusCanvas: function() {
            $("#draw_panel canvas, #draw_panel div, #draw_panel textarea").each(function(){
                    var newWidth = ($(this).width())*1.1;
                    $(this).width(newWidth);
                    var newHeight = ($(this).height())*1.1;
                    $(this).height(newHeight);
                });
        },
         backToWidgetList: function(){
            location = "/widget";
        }

    });

    return new ToobarView;
});
