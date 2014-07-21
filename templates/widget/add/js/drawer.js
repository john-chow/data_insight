define([
"echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
, "echarts/chart/pie"
, "echarts/chart/radar"
, "common/tools"
, "outter_interface"
], function(echart, _b, _l, _s, _p, _r, _tools, _ot) {


/////////////////////////////////////////////////////////////////////
// 
//  DrawManager: 管理图形类。它负责维护专业画图类和更新器类的状态
//  BaseDrawer:  专业绘图类。它是无状态，每次要画图时，都初始化
//  Updator:   更新器类。用来控制自动更新及停止自动更新
//
///////////////////////////////////////////////////////////////////

    window.drawer   = {};
	var DrawManager = function(opt) {
		this.now_drawer				= null;
        this.updator                = new Updator();

        // 对外提供的(重新)开始绘图接口
		this.run	=				function(place, resp, dynamicObj) {
            var type    = resp.type;
            this.ec     = echart.init(place);

			switch(type) {
				case "map":	 	
					this.now_drawer = new MapDrawer();
					break;
				case "bar":	
					this.now_drawer = new BarDrawer();
                    this.now_drawer.setStacked(false);
					break;
                case "s_bar":
					this.now_drawer = new BarDrawer();
                    this.now_drawer.setStacked(true);
                    type = "bar";
                    break;
				case "line":	
					this.now_drawer =  new LineDrawer();
                    this.now_drawer.setStacked(false);
					break;
                case "s_line":
					this.now_drawer =  new LineDrawer();
                    this.now_drawer.setStacked(true);
                    type = "line";
					break;
				case "area":	
					this.now_drawer = new AreaDrawer();
                    this.now_drawer.setStacked(false);
					break;
				case "s_area":	
					this.now_drawer = new AreaDrawer();
                    this.now_drawer.setStacked(true);
                    type = "area";
					break;
				case "pie":
					this.now_drawer = new PieDrawer();
					break;
				case "scatter":
					this.now_drawer = new ScatterDrawer();
					break;
				case "radar":	
					this.now_drawer = new RadarDrawer();
					break;
				default:
					easy_dialog_error('xxxxxxxxxxxx');
					return
			}

			this.now_drawer.init(this.ec, type);

			if ("map" !== type) {
				this.now_drawer.start(resp)
			} else {
				var self = this;
				require(["echarts/chart/map", "echarts/config", "common/city"]
						, function(_m, ecConfig, _t) {
					self.now_drawer.work(resp.data)
				})
			}

            // 重启更新器
            this.updator.bindDrawer(this.now_drawer);
            if(this.updator.isEnable())      this.updator.restart()

            // 为给外部提供可直接操控图表的接口，把绘图对象保存到全局window中
            window.drawer[place.id] = this.now_drawer;
		};

        // 退出管理图型工作
        this.stop           =       function() {
            if(this.ec)         this.ec.clear()
        };

        // 对外提供的获取画图对象的接口
        this.getEc =                function() {
            return this.ec
        };

        this.getDrawer  =           function() {
            return this.now_drawer
        };

        // 提供配置周期更新的接口
        this.setUpdating =            function(periodJson) {
            this.updator.setControl(periodJson);
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
	
        // 初始化drawer工作环境
        this.init =    function(ec, type) {
            this.ec             = ec;
			this.type           = type;
			this.optionCloned   = cloneObject(this.option);
        };

        // 启动drawer工作
        this.start   =   function(resp) {
			//this.optionCloned   = cloneObject(this.option);
            this.work(resp)
        };

        // drawer工作中
		this.work = 	function(resp) {
			this.fillSeries(resp.data);

            // 根据是否有样式，决定是否做style
            if (resp.style)     this.styleChart(resp.style);

			this.draw()
		};

		this.draw =		function(optionData) {
            this.ec.clear();
            var data = optionData || this.optionCloned;
            this.ec.setOption(data)
		};

        // 主要的控制样式部分
        this.styleChart     =   function(style) {
            var self = this;
            self.optionCloned["backgroundColor"] =      style["backgroundColor"];

            $.each(["color", "title", "dataRange", "toolbox"
                    , "tooltip", "dataZoom", "legend", "grid"], function(i, c) {
                // _hide是要求移除此项的标记
                if(style[c] && style[c]["_hide"])   delete self.optionCloned[c]
                $.extend(self.optionCloned[c], style[c])
            })

            $.each(this.optionCloned["series"], function(i, ss) {
                $.extend(ss, style["se"])
            })
        };

        this.styleLegend    =   function(lgStyle) {
        };

        this.setBgColor =   function(color) {
            this.optionCloned.backgroundColor   = color
        };

        this.setIsColors =  function(colorList) {
            this.optionCloned.color = colorList
        };

        this.setSymbols =   function(symbolList) {
            this.optionCloned.symbolList    = symbolList
        };

        this.findSeriesIdxByName    =   function(name) {
            var idx = -1;
            $.each(this.optionCloned.series, function(i, series) {
                if(series['name'] === name) 
                    return idx = i
            })
            return idx
        };

        this.transType  =   function(type) {
            var newType = new toType();
            newType.optionCloned = this.optionCloned;
            return newType
        }
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

        this.seriesNewAdd = [
            0, 0, true, false, null   // 参数意义见echart官网
        ];

		this.seriesOne = {
			type:			""
            /*
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
            */
			, temStyle: {normal: {label : {show: true, position: 'inside'}}}
			, data: []
		};

        this.setStacked         = function(stacked) {
            this.stacked    = stacked
        };

		this.work = function(resp) {
			this.fillAxis(resp.data);
			AxisDrawer.prototype.work.call(this, resp);
		};

        this.styleChart =   function(style) {
            this.styleAxis(style["x"], style["y"]);
            AxisDrawer.prototype.styleChart.call(this, style);
        };

		this.fillAxis = function(data) {
			// 分别加上属性样式，和数值样式
			this.optionCloned["xAxis"] = data.x;
			this.optionCloned["yAxis"] = data.y;
		};

		this.fillSeries = function(data) {
			if (data.legend_series.length > 0) {
				var self = this;

                // 先清空series部分
                self.optionCloned.series = [];
				$.each(data.legend_series, function(i, l_s) {
                    self.seriesOneCloned  = cloneObject(self.seriesOne);

					// 调用子类去做样式
					self.styleSeries(self.seriesOneCloned);

					if ("legend" in  l_s) {
						var legend_name = l_s["legend"];
						self.optionCloned.legend.data.push(legend_name);
						self.seriesOneCloned.name = legend_name;
                        //self.styleLegend(data.style.legend)
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

        this.drawNewAdded    =   function(data) {
            var self = this;
            var dataList = [];
            var idxAdded = [];
            $.each(data['le_val'], function(i, v) {
                var newAddData = cloneObject(self.seriesNewAdd);
                idx = (v['le'] === '') ? 0 : self.findSeriesIdxByName(v['le']);
                newAddData[0] = idx;
                newAddData[1] = v['val'];
                newAddData[4] = data['cat'] && data['cat'].length >= i ? data['cat'][i] : null;
                dataList.push(newAddData);
                idxAdded.push(idx)
            })

            // 对于新增部分中，没有的类别，把数据设为0
            for(var i = 0; i < self.optionCloned.series.length; i++) {
                if ($.inArray(i, idxAdded) < 0) {
                    var newAddData = cloneObject(self.seriesNewAdd);
                    newAddData[0] = i
                    dataList.push(newAddData)
                }
            }

            self.ec.addData(dataList)
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
        this.init          = function(ec, type, stateOption) {
            AreaDrawer.prototype.init.call(this, ec, "line" ,stateOption)
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
            $.extend(this.seriesOneCloned, {
                "smooth":       true
                , "itemStyle":  {normal: {areaStyle: {type: 'default'}}}
            })
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

        this.init      =       function(el, type, stateOption) {
            PieDrawer.prototype.init.call(this, el, "pie", stateOption);

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
            self.seriesOneCloned  = cloneObject(self.seriesOne);
            $.each(data.legend_series, function(i, pair) {
                self.optionCloned.legend.data.push(pair.name);
                self.seriesOneCloned.data.push(pair)
            })
            self.optionCloned.series.push(self.seriesOneCloned)
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

        this.init      =       function(el, type, stateOption) {
            RadarDrawer.prototype.init.call(this, el, "radar", stateOption);
        };

        this.start =            function(resp) {
            $.extend(this.optionCloned, {
                "polar":            []
                , "calculable":     true
            })

            RadarDrawer.prototype.start.call(this, resp)
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


    // 动态更新器
    var Updator       =   function() {
        this.enable         = false;
        this.period         = 0;
        this.interval       = null;

        this.restart  =       function() {
            var self = this;
            
            if(!self.enable)     return

            self.stop();
            self.interval   = setInterval( function() {
                $.ajax({
                    url:            '/widget/draw/timely/'+self.wi_id
                    , type:         "POST"
                    , dataType:     "json"
                    , success:      function(resp) {
                        if('all' === resp.way) {
                            self.drawer.start(resp.data)
                        } else {
                            self.drawer.drawNewAdded(resp.data)
                        }
                    }
                    , error:        function() {
                        self.stop();
                        alert("自动更新失败，请检查网络")
                    }
                })
            }, self.period * 1000)
        };

        this.stop    =       function() {
            if(this.interval)   clearInterval(this.interval);
        };

        this.setControl     = function(periodJson) {
            this.enable  = periodJson.ifupdate || false;
            this.period  = periodJson.period || 0;
            this.wi_id  = periodJson.wi_id
        };

        this.bindDrawer     = function(drawer) {
            this.drawer = drawer
        };

        this.isEnable       = function() {
            return this.enable
        }
    };


	return DrawManager
})


