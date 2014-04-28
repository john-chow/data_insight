define([
"backbone"
, "base_sheet"
, "bootstrap"
, "text!../template/show_area_bar.html" 
], function(Backbone, BaseSheetView, b, showAreaBarHtml) {

    var showAreaBarView = BaseSheetView.extend({

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
            var data = $("#draw_panel").html();
            this.triggerOut("gridster:add", data);
        }
    });

    return showAreaBarView;
})
