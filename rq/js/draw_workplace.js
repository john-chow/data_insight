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
			this.xAxesView 		= new AxesView( {'name': 'column'} );
			this.yAxesView 		= new AxesView( {'name': 'row'} );
			this.drawPanelView	= new DrawPanelView();

			this.xAxesView.on( "save_finished", _.bind(this.drawPanelView.updateData, this.drawPanelView) );
			this.yAxesView.on( "save_finished", _.bind(this.drawPanelView.updateData, this.drawPanelView) );

            this.render();
        },

        render: function() {
			this.$el.append( $('<div id=draw_plots></div>').append(
				this.xAxesView.el
				, this.yAxesView.el
			), this.drawPanelView.el );
        }


    });

    return DrawWorkspaceView;
})
