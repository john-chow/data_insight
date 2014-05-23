define([
"backbone"
, "echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
, "echarts/chart/pie"
, "echarts/chart/radar"
], function(Backbone, echart, _b, _l, _s, _p, _r) {

	var DrawManager = function(opt) {
		this.now_drawer				= null;
		this.axis_drawer			= null;
		this.map_drawer				= null;
		this.polar_drawer			= null;

		this.run	=				function(place, data) {
            var type    = data.type;
            this.ec     = this.ec || echart.init(place);
			switch(data.type) {
				case "map":	 	
					this.now_drawer = this.map_drawer || new MapDrawer;
					break;
				case "bar":	
					this.now_drawer = this.bar_drawer || new BarDrawer;
					break;
				case "line":	
					this.now_drawer = this.line_drawer || new LineDrawer;
					break;
				case "area":	
					this.now_drawer = this.areaDrawer || new AreaDrawer;
					break;
				case "scatter":
					this.now_drawer = this.scatterDrawer || new ScatterDrawer;
					break;
				case "polar":	
					this.now_drawer = this.polar_drawer || new PolarDrawer;
					break;
				default:
					easy_dialog_error('xxxxxxxxxxxx');
					return
			}

			this.now_drawer.ready(this.ec, type);
			if ("map" !== type) {
				this.now_drawer.work(data.data)
			} else {
				var self = this;
				require(["echarts/chart/map", "echarts/config", "common/city"]
						, function(_m, ecConfig, _t) {
					self.now_drawer.work(data.data)
				})
			}
		}
	};
	
	var BaseDrawer = function() {
		this.optionCloned 	= {};
		this.place			= "";
		this.type			= "";
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
	
        this.ready =    function(ec, type) {
            this.ec = ec;
			this.type  = type;
			this.optionCloned = cloneObject(this.option);
        };

		this.work = 	function(data) {
			this.fillSeries(data);
			this.draw()
		};

		this.draw =		function() {
            this.ec.clear();
			this.ec.setOption(this.optionCloned)
		}
	};

	var AxisDrawer = function() {
		this.catStyle = {
			boundaryGap : false
		};

		this.valStyle = {
			axisLabel : {
                formatter: ''
            }
			, splitArea : {show : true}
		};

		this.seriesOne = {
			type:			""
			, markPoint: {
                data: [
                    {type : 'max', name: '最大值'},
                    {type : 'min', name: '最小值'}
                ]
            }
			, markLine: {
                data: [
                    {type : 'average', name: '平均值'}
                ]
            }
			, temStyle: {normal: {label : {show: true, position: 'inside'}}}
			, data: []
		};

		this.work = function(data) {
			this.fillAxis(data);
			AxisDrawer.prototype.work.call(this, data);
		};

		this.fillAxis = function(data) {
			// 调用子类去做轴的样式
			this.styleAxis(data.x, data.y);

			// 分别加上属性样式，和数值样式
			this.optionCloned["xAxis"] = data.x;
			this.optionCloned["yAxis"] = data.y;
		};

		this.fillSeries = function(data) {
			if (data.legend_series.length > 0) {
				var self = this;
				$.each(data.legend_series, function(i, l_s) {
					var seriesOneCloned = cloneObject(self.seriesOne);

					// 调用子类去做样式
					self.styleSeries(seriesOneCloned);

					if ("legend" in  l_s) {
						var legend_name = l_s["legend"];
						self.optionCloned.legend.data.push(legend_name);
						seriesOneCloned.name = legend_name;
					}
					seriesOneCloned.data = l_s["series"];
					seriesOneCloned.type = self.type;
					self.optionCloned.series.push(seriesOneCloned)
				})
			}
			else {
				easy_dialog_error("xxxxxxxxxxx")
			}
		};

	};


	var BarDrawer = function() {
		this.catStyle = {
		};
		
		this.valStyle = {
		};

		this.seriesStyle = {
		};

		this.styleAxis = function() {
		};
		
		this.styleSeries = function() {
		};

	};

	var LineDrawer = function() {
		this.catStyle = {
		};
		
		this.valStyle = {
		};

		this.seriesStyle = {
		};

		this.styleAxis = function() {
		};
		
		this.styleSeries = function() {
		};

	};

	var AreaDrawer = function() {
		this.catStyle = {
		};
		
		this.valStyle = {
		};

		this.seriesStyle = {
		};

		this.styleAxis = function() {
		};
		
		this.styleSeries = function() {
		};

	};

	var ScatterDrawer = function() {
		this.valStyle = {
			power: 1
			, precision: 2
			, scale:true
			, axisLabel : {
                formatter: '{value}'
            }
		};

		this.seriesStyle = {
			markPoint: {
                data : [
                    {type : 'max', name: '最大值'},
                    {type : 'min', name: '最小值'}
                ]
            }
			, markLine: {
                data : [
                    {type : 'average', name: '平均值'}
                ]
            }
		};

		this.styleAxis = function(xList, yList) {
			var self = this;
			$.map(function(xObj) {
				$.extend(xObj, self.valStyle)
			}, xList);

			$.map(function(yObj) {
				$.extend(yObj, self.valStyle)
			}, yList)
		};
		
		this.styleSeries = function(oneObj) {
			$.extend(oneObj, this.seriesStyle)
		};

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

		this.work = function(data) {
			MapDrawer.prototype.work.call(this, data)
		};

		this.fillSeries = function(data) {
			this.optionCloned = cloneObject(this.option);
			var bool_china = false;
			if ( data.hasOwnProperty("point_value") ) 	{
				this.seriesOne.markPoint.data = data["point_value"];
			}
			if ( data.hasOwnProperty("line_value") ) {
				this.seriesOne.markLine.data = data["line_value"];
				this.seriesOne.markPoint.data = $.map(data["line_value"], function(one) {
					return one[1]
				})
			}
			this.seriesOne.geoCoord = getChinaMainCityCoord();
			this.optionCloned.series.push(this.seriesOne);
		};

	};


    // 确定继承关系
	var baseDrawer = new BaseDrawer();
	AxisDrawer.prototype 	= baseDrawer;
	PolarDrawer.prototype 	= baseDrawer;
	MapDrawer.prototype 	= baseDrawer;
	ScatterDrawer.prototype = baseDrawer;
	var axisDrawer = new AxisDrawer();
	BarDrawer.prototype		= axisDrawer;
	LineDrawer.prototype	= axisDrawer;
	AreaDrawer.prototype	= axisDrawer;
	ScatterDrawer.prototype = axisDrawer;


	return DrawManager
})
