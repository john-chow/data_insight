define([
    '/static/js/echarts-all.js'
    , '/static/js/skin/mix.js'
    //"city"
], function(_echart, Mix) {


/////////////////////////////////////////////////////////////////////
// 
//  DrawManager: 管理图形类。它负责维护专业画图类和更新器类的状态
//  BaseDrawer:  专业绘图类。它是无状态，每次要画图时，都初始化
//  Updator:   更新器类。用来控制自动更新及停止自动更新
//
///////////////////////////////////////////////////////////////////

    var DrawManager = function(place) {
        this.place = place;
        this.now_drawer = null;
        this.colorful_object = new Colorful()
    };

    DrawManager.prototype.build = function(entity) {
        var type    = entity.type;
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
            case "funnel":
                this.now_drawer = new FunnelDrawer();
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
                console.log('unknow picture type');
                return false
        }

        this.now_drawer.init(type);
        return this.now_drawer.work(entity)
    };

    DrawManager.prototype.format = function(entity) {
        this.build(entity)
        return this.now_drawer.getOption()
    };

    DrawManager.prototype.draw = function(entity) {
        var self = this;
        var workOk = self.build(entity);
        if (!workOk)        return

        if (!self.colorful_object.getJson()) {
            $.when(self.colorful_object.fetch()).done(
                function() {
                    self.now_drawer.draw(self.place, self.colorful_object.getJson())
                }
            )
        } else {
            self.now_drawer.draw(self.place, self.colorful_object.getJson());
        }
    };

    DrawManager.prototype.getEc = function() {
        return this.now_drawer.getEc()
    };

    DrawManager.prototype.setStyle = function(styleId) {
        var self = this;
        self.colorful_object.setId(styleId);
        if (self.now_drawer) {
            $.when(self.colorful_object.fetch()).done(function(){
                self.now_drawer.draw(self.place, self.colorful_object.getJson())
            })
        }
    }


    /*
     * 皮肤类
     */
    var Colorful = function() {
        this.skinJson = {};
    }

    Colorful.prototype.setId = function(id) {
        this.id = id;
        this.skinJson = ('default' == id) ? {} : null;
    }

    Colorful.prototype.fetch = function() {
        var self = this;
        if ('default' != this.id) {
            var defer = $.Deferred();
            $.ajax('/skin/edit/' + this.id + '/', {
                type:       'GET'
                , dataType: 'json'
                , success:  function(resp)  {
                    self.skinJson = JSON.parse(resp.entity.data);
                    defer.resolve()
                }
            })
            return defer.promise()
        }
    }

    Colorful.prototype.getJson = function() {
        return this.skinJson
    }


    /*
     * 虚基类，不直接实例化
     */
    var BaseDrawer = function() {
        this.optionCloned               = {};
        this.place                      = "";
        this.type                       = "";
    
        // 初始化drawer工作环境
        this.init =    function(type) {
            this.type           = type;
        };

        this.getOption = function() {
            return this.optionCloned
        };

        // 启动drawer工作
        this.work =     function(entity) {
            if (!entity || !entity.figure 
                        || Object.keys(entity.figure).length <= 0)    
                return false

            this.optionCloned = entity.figure;
            return true
        };

        this.extract = function(data) {
            var heads   = data.heads;
            var contents = data.data;
        };

        this.draw =     function(place, colorJson) {
            this.ec = echarts.init(place);
            var option = cloneObject(this.optionCloned);
            if (colorJson) {
                Mix.mix_option(option, colorJson)
            }
            this.ec.setOption(option);
        };

        this.getOption =    function() {
            return this.optionCloned
        };

        this.getEc  = function() {
            return this.ec
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
            type:           ""
            , data: []
        };

        this.setStacked         = function(stacked) {
            this.stacked    = stacked
        };

        /*
        this.work = function(entity) {
            var figure = entity.figure;

            var category    = figure.category;
            var series      = figure.series;
            var heads       = figure.head;
            var legends     = figure.legend;

            //this.fillAxis(entity.data);
            AxisDrawer.prototype.work.call(this, entity);
        };
        */

        this.fillAxis = function(category_item, heads) {
            // 辨别出cat轴，value轴分别对应x、y中哪个
            var cat_location = category.location;
            delete category.location;

            var value_item = [{
                'type':     'value'
            }]

            if ('row' == cat_location) {
                this.optionCloned["xAxis"] = category_item;
                this.optionCloned["yAxis"] = value_item;
            } else {
                this.optionCloned["yAxis"] = category_item
                this.optionCloned["xAxis"] = value_item;;
            }
        };

        this.fillSeries = function(data) {
            if (data.legend_series && data.legend_series.length > 0) {
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
                    self.seriesOneCloned.smooth = true;

                    // 是否要画成聚合状
                    if (self.stacked)       self.seriesOneCloned.stack = "总量";

                    self.seriesOneCloned.data = l_s["series"];
                    self.seriesOneCloned.type = ("type" in l_s) ? l_s["type"] : self.type;
                    if ('yAxisIndex' in l_s) {
                        self.seriesOneCloned['yAxisIndex'] = l_s.yAxisIndex
                    }
                    if ('stack' in l_s) {
                        self.seriesOneCloned['stack'] = l_s["stack"]
                    }
                    self.optionCloned.series.push(self.seriesOneCloned)
                })

            }
            else {
                console.log("xxxxxxxxxxx")
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
        this.fillSeries = function(data) {
            var self = this;

            self.optionCloned.series = [];
            $.each(data.legend_series, function(i, item) {
                var seriesOneCloned = cloneObject(self.seriesOne);
                seriesOneCloned.name = item.legend;
                seriesOneCloned.type = "scatter";

                var rows = item.series;
                var points = _.map(rows, function(row) {
                    return _.first(row, row.length)
                })

                seriesOneCloned.data = points;

                self.optionCloned.legend.data.push(item.legend);
                self.optionCloned.series.push(seriesOneCloned)
            })

        };

        /*
        // 测试气泡图
        this.draw = function() {
            var optionList = ScatterOptionList;

            var self = this;
            var i = 0;
            setInterval(function() {
                var idx = (i++) % 3;
                self.optionCloned = optionList[idx];
                ScatterDrawer.prototype.draw.call(self)
            }, 1000 * 5)

        }
        */
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
            var legends = self.optionCloned.legend.data;
            $.each(data, function(i, item) {
                var kind = item.kind;
                var data = item.data;
                
                self.seriesOneCloned.name = kind;
                $.each(data, function(i, pair) {
                    legends.push(pair.name);
                    self.seriesOneCloned.data.push(pair)
                })
            })
            self.optionCloned.series.push(self.seriesOneCloned);
            legends = _.uniq(legends)
        };

        this.styleSeries = function() {
        };
    };


    var FunnelDrawer = function() {
        this.seriesOne  =       {
            "name":             ""
            , "type":           "funnel"
            , "data":           []
        },

        this.init      =       function(el, type, stateOption) {
            FunnelDrawer.prototype.init.call(this, el, "pie", stateOption);
        },

        this.fillSeries = function(data) {
            var self = this;
            self.seriesOneCloned  = cloneObject(self.seriesOne);
            var legends = self.optionCloned.legend.data;
            $.each(data, function(i, item) {
                var kind = item.kind;
                var data = item.data;
                
                self.seriesOneCloned.name = kind;
                $.each(data, function(i, pair) {
                    legends.push(pair.name);
                    self.seriesOneCloned.data.push(pair)
                })
            })
            self.optionCloned.series.push(self.seriesOneCloned);
            legends = _.uniq(legends)
        }
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

        this.start =            function(entity) {
            $.extend(this.optionCloned, {
                "polar":            []
                , "calculable":     true
            })

            RadarDrawer.prototype.start.call(this, entity)
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

        this.work = function(entity) {
            this.fillRowColumn(entity.data);
            TableDrawer.prototype.work.call(this, entity);
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
            , data: []
        };  

        this.fillSeries = function(data) {
            var seriesOneCloned = cloneObject(this.seriesOne);
            for(var key in data) {
                place = MAP.place_name(key);
                value = data[key] || 0;
                item = {'name': place, 'value': value};

                /*
                row = data[key];
                place = MAP.provice_names(row[1]);
                value = row[0] || 0;
                */

                item = {'name': place, 'value': value};
                seriesOneCloned.data.push(item);
                //this.doExtra(row);
            }
            seriesOneCloned.name = '';
            this.optionCloned.legend.data.push('');
            this.optionCloned.series.push(seriesOneCloned);
        };

        this.doExtra = function(row) {
            var makeup = [row[1], row[3], row[4]]
            this.optionCloned.extra.push(makeup)
        }
    };


    // 确定继承关系
    var baseDrawer = new BaseDrawer();
    AxisDrawer.prototype    = baseDrawer;
    PieDrawer.prototype     = baseDrawer;
    RadarDrawer.prototype   = baseDrawer;
    MapDrawer.prototype     = baseDrawer;
    ScatterDrawer.prototype = baseDrawer;
    FunnelDrawer.prototype  = baseDrawer;
    TableDrawer.prototype   = baseDrawer;
    var axisDrawer = new AxisDrawer();
    BarDrawer.prototype     = axisDrawer;
    LineDrawer.prototype    = axisDrawer;
    AreaDrawer.prototype    = axisDrawer;
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


