define([
"backbone"
, "base_sheet"
, "model/draw_data"
, "echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
, "echarts/chart/pie"
, "echarts/chart/radar"
], function(Backbone, BaseSheetView, DrawModel, ec, _b, _l, _s, _p, _r) {
		
	var DrawPanelView = BaseSheetView.extend({
		tagName: 		"div",
		id:				"draw_panel",

		initialize: function() {
			this.model = new DrawModel();
			this.listenTo(this.model, "change", this.render);
			this.onOut("panel:draw_data", _.bind(this.updateData, this))
		},

		render: function() {
			this.chart = ec.init(this.el)
			var data = this.model.toJSON();
			
			// 如果是地图图形，要加在地图库；否则不需要
			if ( !this.judgeIfMap(data) ) {
				this.chart.setOption(data)
			}
			else {
				var self = this;
				require(["echarts/chart/map"], function(_m) {
					self.chart.setOption(data)
				})
			}
		},


		updateData: function(data) {
			this.model.clear({"silent": true}).set(data);
			this.render()
		},

		judgeIfMap: function(data) {
			if ( !("series" in data) ) {
				return false
			}
			
			for (var i = 0; i < data.series.length; i++) {
				var obj = data.series[i]
				if("map" === obj.type) {
					return true
				}
			}
			
			return false
		}

	});

	return DrawPanelView
})
