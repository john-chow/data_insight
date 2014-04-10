define([
"jquery"
, "backbone"
, "bootstrap"
, "link_db_modal"
, "text!../template/design_menu.html" 
], function($, Backbone, x, linkDbModal, menuHtml) {

    var MenusView = Backbone.View.extend({

        tagName: "div",
        id: "design_menu",
        className: "container",

        events: {
            "click .intelligent-display-name":                "changeIntelligentDisplay"
            ,"mouseover .intelligent-display-pic button":     "showTips"
        },

        initialize: function() {
            this.linkDbModal = new linkDbModal();
            this.render();
            this.$("#menu_link_db").on( "click", _.bind(this.showLinkDbModal, this) );
        },

        render: function() {
            this.$el.html(menuHtml);
        },

        changeIntelligentDisplay: function(e) {
            if(this.$(".intelligent-display-pic").css("display") == "none")
                this.$(".intelligent-display-pic").slideDown("normal");
            else
                this.$(".intelligent-display-pic").slideUp("normal");
        },

        showTips: function(ev) {
            this.$(".intelligent-display-tips").html("提示："+$(ev.target).attr("title"));
        },

        showLinkDbModal: function(ev){
            this.linkDbModal.render();
        }



    });

    return MenusView;
});
