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
		mapDrawer:		null,
		normalDrawer:	null,

		initialize: function() {
			this.model = new DrawModel();
			this.listenTo(this.model, "change", this.render);
			this.onOut("panel:draw_data", _.bind(this.updateData, this));
			this.normalDrawer = new NormalDrawer()
		},

		render: function() {
			var data = this.model.toJSON();
			
			var drawer = new MapDrawer();
			drawer.draw(this.el, data);
			
			/*
			// 如果是地图图形，要加在地图库；否则不需要
			if ( !this.judgeIfMap(data) ) {
				this.normalDrawer.draw(this.el, data)
			}
			else {
				this.mapDrawer = this.mapDrawer || new MapDrawer();
				this.mapDrawer.draw(this.el, data)
			}
			*/
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



	var BaseDrawer = function() {
		this.option = {
			'title': 					{}
			, 'tooltip': 				{}
			, 'legend':					{
				'origent':				'vertical'
				, 'x':					'left'
				, 'data':				[]
			}
			, 'toolbox': 				{
        		'show' : 				true,
				'orient' : 				'vertical',
				'x': 					'right',
				'y': 					'center',
				'feature' : {
					'mark' : 			{'show': true},
					'dataView' : 		{'show': true, 'readOnly': false},
					'restore' : 		{'show': true},
					'saveAsImage' : 	{'show': true}
				}
			}
			, 'dataRange':				{
				'min': 			0,
				'max' : 		100,
				'calculable' : 	true,
				'color': 		['red','orange','yellow','lightgreen'],
				'textStyle':{
					'color':	'#fff'
				}
			}
			, 'series':		[
			]
		};

		this.draw =		function($place, data) {
			this.chart = ec.init($place);
			this.chart.setOption(data)
		}
	};

	var MapDrawer = function() {
		this.serial = {
			'name':				''
			, 'type':			'map'
			, 'mapType':		'china'
			, 'verable': 		false
			, 'roam':			true
			, 'data': 			[]
			, 'selectedMode':  	'single'
			, 'markPoint': 		{
                'symbolSize': 	5	
				, 'itemStyle': 	{
                    'normal': {
                        'borderColor': '#87cefa',
                        'borderWidth': 1,            
                        'label': {
                            'show': 	false
                        }
                    }
					, 'emphasis': {
                       'borderColor': '#1e90ff'
					   , 'borderWidth': 5
						, 'label': {
                            'show': 	true
                        }
                    }
                }
				, 'data':				[]
			}
			, 'geoCoord':				{}
			, 'markLine':				{
				'smooth':				true,
                'symbol': 				['none', 'circle'],  
                'symbolSize' : 			1,
                'itemStyle' : 			{
                    'normal': 			{
                        'color':	'#fff',
                        'borderWidth':	1,
                        'borderColor':	'rgba(30,144,255,0.5)'
                    }
                },
                'data' : [
				]
			}
		};

		this.draw = function($place, data) {
			// option属性来自原型，不可被改变
			this.optionCloned = cloneObject(this.option);
			this.place = $place;
			var self = this;
			var bool_china = false;
			require(["echarts/chart/map", "echarts/config", "common/city"]
					, function(_m, ecConfig, _t) {

				if ( data.hasOwnProperty("point_value") ) 	{
					self.map_kind = "point_value"
					self.serial.markPoint.data = data[self.map_kind];
				}
				else if ( data.hasOwnProperty("line_value") ) {
					self.map_kind = "line_value"
					self.serial.markLine.data = data[self.map_kind]
				}
				self.serial.geoCoord = getChinaMainCityCoord();

				self.optionCloned.series.push(self.serial);
				MapDrawer.prototype.draw.call(self, $place, self.optionCloned);
				self.drawTopN(3);

				// 响应点击事件，显示更详细信息
				self.chart.on(ecConfig.EVENT.MAP_SELECTED, function(param){
					var mapType;
					var tmpOption = cloneObject(self.optionCloned);
					if (!bool_china) {
						for (var prov in param.selected) {
							if (param.selected[prov]) {
								mapType = prov;
								bool_china = true;
								tmpOption.series[0].data = tmpOption.series[0].markPoint.data.slice(0);	
								// 移除这几项，否则显示不出图像
								delete tmpOption.series[0].markLine;
								delete tmpOption.series[0].markPoint;
								delete tmpOption.series[0].geoCoord;
							}
						}
					}
					else {	
						mapType = 'china';
						bool_china = false;
					}
					tmpOption.series[0].mapType = mapType;	// 这里写1是因为不明白上面require会被调用两次
					self.chart.setOption(tmpOption, true)
				})
			})
		};

		this.drawTopN = function(n) {
			var len = this.optionCloned.series.length;
			if ("point_map" === this.map_kind) {
				var allValues = this.optionCloned.series[len-1].markPoint.data;
				var topN = allValues.sort(dynamicSort("-value")).slice(0, n);
				this.optionCloned.series[len-1].markPoint = {
                	symbol:'emptyCircle',
                	symbolSize : function(v){
                    	return 10 + v/100
                	},
                	effect : {
                    	show: true,
                    	shadowBlur : 0
                	},
                	itemStyle:{
                    	normal:{
                        label:{show:false}
                    	}
                	},
                	data : topN
				}
			}
			else if ("line_map" === this.map_kind) {
				var allValues = this.optionCloned.series[len-1].markLine.data;
				var topN = allValues.sort(this.markLineSort(true)).slice(0, n);
				this.optionCloned.series[len-1].markLine = {
					smooth:				true,
					effect : {
						show: 			true,
						size: 			3,
						shadowColor: 	'lime'
					},
					itemStyle : {
						normal: {
							borderWidth:1
						}
					},
					data: 	topN
				}
			}

			MapDrawer.prototype.draw.call(this, this.place, this.optionCloned)
		},

		this.markLineSort = function(asend) {
			if (asend) {
				return function(a, b) {
					return a[1].value < b[1].value
				}
			} else {
				return function(a, b) {
					return a[1].value > b[1].value
				}
			}
		}
	};

	var NormalDrawer = function() {
	};


	MapDrawer.prototype = new BaseDrawer();
	NormalDrawer.prototype = new BaseDrawer();


	return DrawPanelView
})
