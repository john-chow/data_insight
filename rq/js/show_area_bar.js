define([
"backbone"
, "bootstrap"
, "text!../template/show_area_bar.html" 
], function(Backbone, b, showAreaBarHtml) {

    var showAreaBarView = Backbone.View.extend({

        tagName:            "div",
        id:                 "show_area_bar",

        events: {
         
        },

        initialize: function() {
           this.render();
        },

        render: function() {
            this.$el.html(showAreaBarHtml);
        }
    });

    return showAreaBarView;
})
