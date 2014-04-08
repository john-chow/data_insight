define([
"jquery"
, "backbone"
, "bootstrap"
, "text!../template/design_menu.html" 
], function($, Backbone, x, menuHtml) {

    var MenusView = Backbone.View.extend({

        tagName: "div",
        id: "design_menu",
        className: "container",

        events: {
            "click .intelligent-display-name":                "changeIntelligentDisplay"
            ,"mouseover .intelligent-display-pic button":     "showTips"
        },

        initialize: function() {
            this.render();
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
        }

    });

    return MenusView;
});
