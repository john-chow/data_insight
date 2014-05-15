define([
"jquery"
, "backbone"
, "bootstrap"
, "link_db_modal"
, "intelligent_display"
, "text!../template/design_menu.html" 
], function($, Backbone, x, linkDbModal, intelligentDisplay, menuHtml) {

    var MenusView = Backbone.View.extend({

        tagName: "div",
        id: "design_menu",
        className: "container",

        events: {
            "click #open_work_book" :        "openWorkBook",
            "click #save_work_book" :        "saveWorkBook",
            "click #design_menu_ico_minus":  "minusCanvas",
            "click #design_menu_ico_plus":   "plusCanvas",
        },

        initialize: function() {
            this.linkDbModal = new linkDbModal();
            this.intelligentDisplay=new intelligentDisplay();
            this.render();
            this.$("#menu_link_db").on( "click", _.bind(this.showLinkDbModal, this) );
        },

        render: function() {
            this.$el.html(menuHtml);
            this.$el.find("#design_menu_ico").append(
                this.intelligentDisplay.el
            );
        },

        showLinkDbModal: function(ev){
            this.linkDbModal.render();
        },

        openWorkBook: function() {
            Backbone.Events.trigger("work_book:open");
        },

        saveWorkBook: function() {
            Backbone.Events.trigger("work_book:save");
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

    });

    return MenusView;
});
