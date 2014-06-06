define([
"echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
, "echarts/chart/pie"
, "echarts/chart/radar"
, "common/tools"
], function(echart, _b, _l, _s, _p, _r) {

	var DrawManager = function(opt) {
		this.now_drawer				= null;
		this.axis_drawer			= null;
		this.map_drawer				= null;
		this.polar_drawer			= null;

        // 对外提供的(重新)开始绘图接口
		this.run	=				function(place, data) {
            var type    = data.type;
            this.ec     = this.ec || echart.init(place);
			switch(type) {
				case "map":	 	
					this.now_drawer = this.map_drawer || new MapDrawer;
					break;
				case "bar":	
					this.now_drawer = this.bar_drawer || new BarDrawer;
                    this.now_drawer.setStacked(false);
					break;
                case "s_bar":
					this.now_drawer = this.bar_drawer || new BarDrawer;
                    this.now_drawer.setStacked(true);
                    type = "bar";
                    break;
				case "line":	
					this.now_drawer = this.line_drawer || new LineDrawer;
                    this.now_drawer.setStacked(false);
					break;
                case "s_line":
					this.now_drawer = this.line_drawer || new LineDrawer;
                    this.now_drawer.setStacked(true);
                    type = "line";
					break;
				case "area":	
					this.now_drawer = this.areaDrawer || new AreaDrawer;
                    this.now_drawer.setStacked(false);
					break;
				case "s_area":	
					this.now_drawer = this.areaDrawer || new AreaDrawer;
                    this.now_drawer.setStacked(true);
                    type = "area";
					break;
				case "pie":
					this.now_drawer = this.pieDrawer || new PieDrawer;
					break;
				case "scatter":
					this.now_drawer = this.scatterDrawer || new ScatterDrawer;
					break;
				case "radar":	
					this.now_drawer = this.polar_drawer || new RadarDrawer;
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
		};

        // 退出管理图型工作
        this.stop =                function() {
            if(this.ec)         this.ec.clear()
        };

        // 对外提供的获取画图对象的接口
        this.getEc =                function() {
            return this.ec
        }
	};
	
    /*
     * 虚基类，不直接实例化
     */
	var BaseDrawer = function() {
		this.optionCloned 	            = {};
		this.place			            = "";
		this.type			            = "";
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
		};

	};


    /* 
     * 虚基类
     */
	var AxisDrawer = function() {
        // 是否是聚合型图，即有没有stacked
        this.stacked        = false;

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

        this.setStacked         = function(stacked) {
            this.stacked    = stacked
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
                    self.seriesOneCloned  = cloneObject(self.seriesOne);

					// 调用子类去做样式
					self.styleSeries(self.seriesOneCloned);

					if ("legend" in  l_s) {
						var legend_name = l_s["legend"];
						self.optionCloned.legend.data.push(legend_name);
						self.seriesOneCloned.name = legend_name;
					}

                    // 是否要画成聚合状
                    if (self.stacked)       self.seriesOneCloned.stack = "总量";

					self.seriesOneCloned.data = l_s["series"];
					self.seriesOneCloned.type = self.type;
					self.optionCloned.series.push(self.seriesOneCloned)
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
        this.ready          = function(ec, type) {
            AreaDrawer.prototype.ready.call(this, ec, "line")

            $.extend(this.seriesOneCloned, {
                "smooth":       true
                , "itemStyle":  {normal: {areaStyle: {type: 'default'}}}
            })
        };

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


    var PieDrawer   = function() {
        this.seriesOne  =       {
            "name":             ""
            , "type":           "pie"
            , "radius":         "55%"
            , "center":         ['50%', 225]
            , "data":           []
        },

        this.ready      =       function(el, type) {
            PieDrawer.prototype.ready.call(this, el, "pie");

            $.extend(this.optionCloned, {
                "tooltip": {
                    trigger:        'item'
                    , formatter:    "{a} <br/>{b} : {c} ({d}%)"
                }
                , "calculable":     true
            })
        };

        this.fillSeries     =   function(data) {
            var self = this;
            $.each(data.legend_series, function(i, pair) {
                self.seriesOneCloned  = cloneObject(self.seriesOne);
                self.optionCloned.legend.data.push(pair.name);
                self.seriesOneCloned.data.push(pair)
                self.optionCloned.series.push(self.seriesOneCloned)
            })
        };

		this.styleSeries = function() {
		};
    };


	var RadarDrawer = function() {
        this.seriesOne = {
            name:           ""
            , type:         "radar"
            , data:         []
        };

        this.ready      =       function(el, type) {
            RadarDrawer.prototype.ready.call(this, el, "radar");

            $.extend(this.optionCloned, {
                "polar":            []
                , "calculable":     true
            })
        };

        this.fillSeries     =       function(data) {
            var self = this;
            $.each(data.legend_series, function(i, pair) {
                self.seriesOneCloned  = cloneObject(self.seriesOne);
                self.seriesOneCloned.data.push(pair);
                self.optionCloned.legend.data.push(pair.name)
                self.optionCloned.series.push(self.seriesOneCloned)
            })

            self.optionCloned.polar.push({
                "indicator":            data.indicator
            })
        }
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
	PieDrawer.prototype 	= baseDrawer;
	RadarDrawer.prototype 	= baseDrawer;
	MapDrawer.prototype 	= baseDrawer;
	ScatterDrawer.prototype = baseDrawer;
	var axisDrawer = new AxisDrawer();
	BarDrawer.prototype		= axisDrawer;
	LineDrawer.prototype	= axisDrawer;
	AreaDrawer.prototype	= axisDrawer;
	ScatterDrawer.prototype = axisDrawer;


	return DrawManager
})
