define([
"backbone"
, "bootstrap"
, "draw_panel"
, "axes"
], function(Backbone, b, DrawPanelView, AxesView) {

    var DrawWorkspaceView = Backbone.View.extend({
        
        tagName:    "div",
        id:         "draw_workplace",

        events: {
            "dblclick"                               : "open",
            "click .icon.doc"                        : "select",
        },

        initialize: function() {
			this.xAxesView 		= new AxesView( {'name': 'x'} );
			this.yAxesView 		= new AxesView( {'name': 'y'} );
			this.drawPanelView	= new DrawPanelView();

            this.render();
        },

        render: function() {
			this.$el.append( $('<div id=draw_plots></div>').append(
				this.yAxesView.el
				, this.xAxesView.el
			), this.drawPanelView.el );
        }


    });

    return DrawWorkspaceView;
})
