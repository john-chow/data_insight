define([
"backbone"
, "model/draw_data"
, 'lib/d3.v3.min'
, 'lib/vega'
], function(Backbone, DrawModel, _d3, _vg) {
		
	var DrawPanelView = Backbone.View.extend({
		tagName: 		"div",
		id:				"draw_panel",

		initialize: function() {
			this.model = new DrawModel();
			//this.listenTo(this.model, "change", this.render);
			Backbone.Events.on( "panel:draw_data", _.bind(this.updateData, this) )
		},

		render: function() {
			var self = this;
			var data = this.model.toJSON();
			
			d3.select("#draw_panel").selectAll("*").remove();
			if( Object.keys(data).length > 0 ) {
				vg.parse.spec(data, function(chart) {
					var view = chart({
						el: "#draw_panel"
						, data: undefined
						, renderer: 'canvas'
					});
					view.update();
				});
			}
		},


		updateData: function(data) {
			this.model.clear({"silent": true}).set(data);
			this.render()
		}
	});

	return DrawPanelView
})
