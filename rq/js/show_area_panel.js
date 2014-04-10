define([
"backbone"
, "bootstrap"
, "info_workplace"
, "text!../template/show_area_panel.html" 
], function(Backbone, b, infoWorkplaceView, showAreaPanelHtml) {

    var showAreaPanelView = Backbone.View.extend({

        tagName:            "div",
        id:                 "show_area_panel",

        events: {
         
        },

        initialize: function() {
           this.infoWorkplaceView = new infoWorkplaceView();
           this.render();
        },

        render: function() {
            this.$el.html(showAreaPanelHtml);
            this.$el.append(this.infoWorkplaceView.el);
        }
    });

    return showAreaPanelView;
})
