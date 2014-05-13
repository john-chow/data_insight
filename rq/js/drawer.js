define([
"backbone"
, "echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
, "echarts/chart/pie"
, "echarts/chart/radar"
], function(Backbone, ec, _b, _l, _s, _p, _r) {

	var Drawer = function() {
		this.now_drawer				= null;
		this.axis_drawer			= null;
		this.map_drawer				= null;
		this.polar_drawer			= null;

		this.run	=				function(place, data) {
			switch(data.type) {
				case "map":	 	
					this.now_drawer = this.map_drawer || new MapDrawer;
					break;
				case "axis":	
					this.now_drawer = this.axis_drawer || new AxisDrawer;
					break;
				case "polar":	
					this.now_drawer = this.polar_drawer || new PolarDrawer;
					break;
				default:
					easy_dialog_error('xxxxxxxxxxxx')
			}

			if ("map" !== data.type) {
				this.now_drawer.work(place, data.data)
			} else {
				var self = this;
				require(["echarts/chart/map", "echarts/config", "common/city"]
						, function(_m, ecConfig, _t) {
					self.now_drawer.work(place, data.data)
				})
			}
		}
	};
	
	var BaseDrawer = function() {
		this.optionCloned 	= {};
		this.place			= "";
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
	
		this.draw =		function() {
			var chart = ec.init(this.place);
			chart.setOption(this.optionCloned)
		};

		this.work = 	function(place, data) {
			this.place = place;
			this.fillSeries(data);
			this.draw()
		}
	};

	var AxisDrawer = function() {
		this.catOne = {
			type : 'category'
			, boundaryGap : false
			, data : []
		};

		this.valOne = {
			type : 'value'
			, axisLabel : {
                formatter: ''
            }
			, splitArea : {show : true}
		};

		this.work = function() {
			this.fillAxis();
			this.fillSeries()
		};

		this.fillAxis = function() {
		};

		this.fillSeries = function() {
		}
	};

	var PolarDrawer = function() {
	};

	var MapDrawer = function() {
		this.seriesOne = {
            name: '全国'
			, type: 'map'
			, roam: true
			, hoverable: false
			, mapType: 'china'
			, itemStyle:{
                normal:{
                    borderColor:'rgba(100,149,237,1)'
					, borderWidth:0.5
					, areaStyle:{
                        color: '#1b1b1b'
                    }
                }
            },
            data:[]
			, markLine : {
                smooth:true
				, symbol: ['none', 'circle']
				,  symbolSize : 1,
                itemStyle : {
                    normal: {
                        color:'#fff'
						, borderWidth:1
						, borderColor:'rgba(30,144,255,0.5)'
                    }
                }
				, data : [],
            },
			markPoint : {
				symbol:'emptyCircle'
				, symbolSize : function(v){
					return 10 + v/10
				}
				, effect : {
					show: true,
					shadowBlur : 0
				}
				, itemStyle:{
					normal:{
						label:{show:false}
					}
				}
				, data : []
			}
			, geoCoord: {
            }
        };

		this.work = function(place, data) {
			MapDrawer.prototype.work.call(this, place, data)
		};

		this.fillSeries = function(data) {
			this.optionCloned = cloneObject(this.option);
			var bool_china = false;
			if ( data.hasOwnProperty("point_value") ) 	{
				this.map_kind = "point_map"
				this.seriesOne.markPoint.data = data["point_value"];
			}
			else if ( data.hasOwnProperty("line_value") ) {
				this.map_kind = "line_map"
				this.seriesOne.markLine.data = data["line_value"]
				this.seriesOne.markPoint.data = $.map(data["line_value"], function(one) {
					return one[1]
				})
			}
			this.seriesOne.geoCoord = getChinaMainCityCoord();
			this.optionCloned.series.push(this.seriesOne);
		}
	};


	var baseDrawer = new BaseDrawer();
	AxisDrawer.prototype 	= baseDrawer;
	PolarDrawer.prototype 	= baseDrawer;
	MapDrawer.prototype 	= baseDrawer;


	return Drawer
})
