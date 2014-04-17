define([
"backbone"
, "model/draw_data"
, "echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
], function(Backbone, DrawModel, ec, _b, _l, _s) {
		
	var DrawPanelView = Backbone.View.extend({
		tagName: 		"div",
		id:				"draw_panel",

		initialize: function() {
			this.model = new DrawModel();
			this.listenTo(this.model, "change", this.render);
			Backbone.Events.on( "panel:draw_data", _.bind(this.updateData, this) );
		},

		render: function() {
			this.chart = ec.init(this.el)
			var data = this.model.toJSON();
			this.chart.setOption(data)
		},


		updateData: function(data) {
			this.model.clear({"silent": true}).set(data);
			this.render()
		}
	});

	return DrawPanelView
})
