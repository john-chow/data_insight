define([
"backbone"
, "base_sheet"
, "model/draw_data"
, "echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
, "echarts/chart/pie"
], function(Backbone, BaseSheetView, DrawModel, ec, _b, _l, _s, _p) {
		
	var DrawPanelView = Backbone.View.extend({
		tagName: 		"div",
		id:				"draw_panel",

		initialize: function() {
			this.model = new DrawModel();
			this.listenTo(this.model, "change", this.render);
			this.onOut("panel:draw_data", _.bind(this.updateData, this))
			//Backbone.Events.on( "panel:draw_data", _.bind(this.updateData, this) );
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
