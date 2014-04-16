define([
"backbone"
, "bootstrap"
, "text!../template/show_area_bar.html" 
], function(Backbone, b, showAreaBarHtml) {

    var showAreaBarView = Backbone.View.extend({

        tagName:            "div",
        id:                 "show_area_bar",

        events: {
          "click #choosed_chart li":         "addWidget",
        },

        initialize: function() {
           this.render();
        },

        render: function() {
            this.$el.html(showAreaBarHtml);
        },

        addWidget: function(ev) {
            var data = $(ev.target).attr("data");
            Backbone.Events.trigger("gridster:add", data);
        }
    });

    return showAreaBarView;
})
