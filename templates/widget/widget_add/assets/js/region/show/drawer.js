define([
"echarts"
, "echarts/chart/bar"
, "echarts/chart/line"
, "echarts/chart/scatter"
, "echarts/chart/pie"
, "echarts/chart/radar"
, "tool"
], function(echart) {


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

        this.init   =   function(place) {
            this.ec     = echart.init(place);
        };

        // 对外提供的(重新)开始绘图接口
		this.run	=				function(place, resp, dynamicObj) {
            if(!this.ec)        this.ec = echart.init(place)

            var type = resp.type;
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
                case "table":
                    this.now_drawer = new TableDrawer();
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
				require(["echarts/chart/map", "echarts/config"/*, "common/city"*/]
						, function(_m, ecConfig, _t) {
                    self.now_drawer.start(resp)
					//self.now_drawer.work(resp.data)
				})
			}

            // 重启更新器
            this.updator.bindDrawer(this.now_drawer);
            if(this.updator.isEnable())      this.updator.restart()
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
			'legend':					{
				'data':				[]
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
            //if (resp.style)     this.styleChart(resp.style);

			this.draw()
		};

		this.draw =		function(optionData) {
            this.ec.clear();
            var data = optionData || this.optionCloned;
            console.log(JSON.stringify(data));
            this.ec.setOption(data)
		};

        this.styleLegend    =   function(lgStyle) {
        };

        this.findSeriesIdxByName    =   function(name) {
            var idx = -1;
            $.each(this.optionCloned.series, function(i, series) {
                if(series['name'] === name) 
                    return idx = i
            })
            return idx
        }
	};


    /* 
     * 虚基类
     */
	var AxisDrawer = function() {
        // 是否是聚合型图，即有没有stacked
        this.stacked        = false;

        this.seriesNewAdd = [
            0, 0, true, false, null   // 参数意义见echart官网
        ];

		this.seriesOne = {
			type:			""
			//, temStyle: {normal: {label : {show: true, position: 'inside'}}}
			, data: []
		};

        this.setStacked         = function(stacked) {
            this.stacked    = stacked
        };

		this.work = function(resp) {
			this.fillAxis(resp.data);
			AxisDrawer.prototype.work.call(this, resp);
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
        }
	};


	var BarDrawer = function() {
		this.styleAxis = function() {
		};
		
		this.styleSeries = function() {
		};

	};

	var LineDrawer = function() {
		this.styleAxis = function() {
		};
		
		this.styleSeries = function() {
		};

	};

	var AreaDrawer = function() {
        this.init          = function(ec, type, stateOption) {
            AreaDrawer.prototype.init.call(this, ec, "line" ,stateOption)
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
            , "data":           []
        },

        this.init      =       function(el, type, stateOption) {
            PieDrawer.prototype.init.call(this, el, "pie", stateOption);

            $.extend(this.optionCloned, {
                /*
                "tooltip": {
                    trigger:        'item'
                    , formatter:    "{a} <br/>{b} : {c} ({d}%)"
                }
                , "calculable":     true
                */
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


    var TableDrawer     =   function() {
        this.rowList = [];
        this.columnList = [];
        this.rowNum = 0;
        this.columnNum = 0;

		this.work = function(resp) {
			this.fillRowColumn(resp.data);
			TableDrawer.prototype.work.call(this, resp);
		};

        this.fillSeries     =       function(data) {
            var self = this;

            var rowPosList = $.map(data["belong_row"], function(i) {
                return self.estRowPos(i)
            });
            var columnPosList = $.map(data["belong_column"], function(i) {
                return self.estColumnPos(i)
            });

            for(var k in data) {
                if(k !== "row" && k !== "belong_row" 
                                && k != "column" && k != "belong_column") {

                    var unitData = [];
                    for (var i = 0; i < self.columnNum * self.rowNum; i++) {    
                        unitData.push('')
                    }

                    $.each(data[k], function(i, val) {
                        var rowPos      = rowPosList[i];
                        var columnPos   = columnPosList[i];
                        var pos = rowPos * self.columnNum + columnPos;
                        unitData[pos] = val
                    })

                    var unitSeries = {
                        "name":             k        
                        , "type":           "table"
                        , "data":           unitData 
                    };
                    self.optionCloned.series.push(unitSeries)
                }
            }
        };

        this.fillRowColumn  =       function(data) {
            this.optionCloned["row"] = data["row"];
            this.optionCloned["column"] = data["column"]

            this.calcRowNum(data["row"]);
            this.calcColumnNum(data["column"]);
        };

        this.calcRowNum     =       function(list) {
            var self = this;
            $.each(list, function(i, obj) {
                self.rowList.push(obj.classes);
                if (0 == i) 
                    self.rowNum = obj.classes.length
                else
                    self.rowNum *= obj.classes.length
            })
        };

        this.calcColumnNum  =       function(list) {
            var self = this;
            $.each(list, function(i, obj) {
                self.columnList.push(obj.classes);
                if (0 == i) 
                    self.columnNum = obj.classes.length
                else
                    self.columnNum *= obj.classes.length
            })
        };

        this.estRowPos      =       function(rowClasses) {
            var len = rowClasses.length;
            var nextLoopLen = 1;
            var pos = 0;
            for (var i = len - 1; i >= 0; i--) {
                var theRowKindsList = this.rowList[i];
                var idx = theRowKindsList.indexOf(rowClasses[i]);
                pos = idx * nextLoopLen + pos;
                nextLoopLen = theRowKindsList.length
            }
            return pos
        };

        this.estColumnPos   =       function(colClasses) {
            var len = colClasses.length;
            var nextLoopLen = 1;
            var pos = 0;
            for (var i = len - 1; i >= 0; i--) {
                var theColumnKindsList = this.columnList[i];
                var idx = theColumnKindsList.indexOf(colClasses[i]);
                pos = idx * nextLoopLen + pos;
                nextLoopLen = theColumnKindsList.length
            }
            return pos
        }          
    };


	var MapDrawer = function() {
		this.seriesOne = {
            name:   ''
			, type: 'map'
			, mapType: 'china'
            , data:[]
        };

		this.work = function(data) {
			MapDrawer.prototype.work.call(this, data)
		};

		this.fillSeries = function(data) {
            if (data.legend_series.length > 0) {
                var self = this;

                // 先清空series部分
                self.optionCloned.series = [];
                $.each(data.legend_series, function(i, l_s) {
                    self.seriesOneCloned  = cloneObject(self.seriesOne);
                    var legend_name = l_s["legend"];
                    self.seriesOneCloned.name = legend_name;
                    self.seriesOneCloned.type = 'map';
                    self.seriesOneCloned.mapType = 'china';
                    var series_data = self.convert(l_s["series"]);
                    self.seriesOneCloned.data.push(series_data);
                    self.seriesOneCloned.data = [
                        {'name': '广东',    'value':    100},
                        {'name': '北京',    'value':    500},
                        {'name': '四川',    'value':    600},
                    ];
                    self.optionCloned.legend.data.push(legend_name);
                    self.optionCloned.series.push(self.seriesOneCloned)
                })
            }
        };

        this.convert  =         function(data) {
            var series = [];
            for (var district in data) {
                series.push({ 
                    'name':     district
                    , 'value':  data[district]
                })
            }
            return series
        }
    };


    // 确定继承关系
	var baseDrawer = new BaseDrawer();
	AxisDrawer.prototype 	= baseDrawer;
	PieDrawer.prototype 	= baseDrawer;
	RadarDrawer.prototype 	= baseDrawer;
	MapDrawer.prototype 	= baseDrawer;
	ScatterDrawer.prototype = baseDrawer;
    TableDrawer.prototype   = baseDrawer;
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


