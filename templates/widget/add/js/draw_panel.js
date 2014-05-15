define([
"backbone"
, "base_sheet"
, "model/draw_data"
, "drawer"
], function(Backbone, BaseSheetView, DrawModel, Drawer) {
	
	var DrawPanelView = BaseSheetView.extend({
		tagName: 		"div",
		id:				"draw_panel",
		mapDrawer:		null,
		normalDrawer:	null,

		initialize: function() {
			this.model = new DrawModel();
			this.listenTo(this.model, "change", this.render);
			this.onOut("panel:draw_data", _.bind(this.updateData, this));
			this.drawer = new Drawer()
		},

		render: function() {
			var data = this.model.toJSON();
			this.drawer.run(this.el, data);
			
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
