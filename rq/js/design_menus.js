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
        },

        initialize: function() {
            this.linkDbModal = new linkDbModal();
            this.intelligentDisplay=new intelligentDisplay();
            this.render();
            this.$("#menu_link_db").on( "click", _.bind(this.showLinkDbModal, this) );
        },

        render: function() {
            this.$el.html(menuHtml);
            this.$el.find(".navbar-nav").append(
                this.intelligentDisplay.el
            );
        },

        showLinkDbModal: function(ev){
            this.linkDbModal.render();
        }

    });

    return MenusView;
});
