define([
"backbone"
, "model/draw_data"
, "echarts"
, "echarts/chart/bar"
], function(Backbone, DrawModel, ec, bar) {
		
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

			Data = option = {
				title : {
					text: '世界人口总量',
					subtext: '数据来自网络'
				},
				tooltip : {
					trigger: 'axis'
				},
				legend: {
					data:['2011年', '2012年']
				},
				toolbox: {
					show : true,
					feature : {
						mark : {show: true},
						dataView : {show: true, readOnly: false},
						magicType: {show: true, type: ['line', 'bar']},
						restore : {show: true},
						saveAsImage : {show: true}
					}
				},
				calculable : true,
				xAxis : [
					{
						type : 'value',
						boundaryGap : [0, 0.01]
					}
				],
				yAxis : [
					{
						type : 'category',
						data : ['巴西','印尼','美国','印度','中国','世界人口(万)']
					}
				],
				series : [
					{
						name:'2011年',
						type:'bar',
						data:[18203, 23489, 29034, 104970, 131744, 630230]
					},
					{
						name:'2012年',
						type:'bar',
						data:[19325, 23438, 31000, 121594, 134141, 681807]
					}
				]
			};

	return DrawPanelView
})
