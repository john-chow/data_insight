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

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(menuHtml);
        }

    });

    return MenusView;
});
