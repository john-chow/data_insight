define([
    '/static/js/echarts-all.js'
    , '/static/js/skin/mix.js'
    , 'ol'
], function(_echart, Mix, ol) {


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
            case "gis":
                this.now_drawer = new GisDrawer();
                break;
            default:
                console.log('unknow picture type');
                return false
        }

        this.now_drawer.init(type, this.place);
        return this.now_drawer.work(entity)
    };

    DrawManager.prototype.format = function(entity) {
        this.build(entity)
        return this.now_drawer.getOption()
    };

    DrawManager.prototype.draw = function(entity) {
        var self = this;

        // 表示新画图；否则是重画
        if (entity) {
            var workOk = self.build(entity);
            if (!workOk)        return
        } 

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
        return this.now_drawer && this.now_drawer.getEc()
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
        if (this.id) {
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
        this.init =    function(type, place) {
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

        this.draw =     function(place, colorJson) {
            this.ec = echarts.init(place);
            var option = cloneObject(this.optionCloned);
            if (colorJson) {
                Mix.mix_option(option, colorJson)
            }
            this.transform && this.transform(option);
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
    };

    var LineDrawer = function() {
    };

    var AreaDrawer = function() {
        this.transform = function(option) {
            if (option && option.series) {
                _.each(option.series, function(one) {
                    one.smooth      = true;
                    one.itemStyle   = {normal: {areaStyle: {type: "default"}}}
                })
            }
        }
    };

    var ScatterDrawer = function() {
    };

    var PieDrawer   = function() {
    };

    var FunnelDrawer = function() {
    };

    var RadarDrawer = function() {
    };

    var TableDrawer = function() {
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

    var GisDrawer = function() {
        this.init = function(type, place) {
            this.place_id = place.id;
        }

        this.work = function(entity) {
            if (!entity || !entity.figure 
                        || Object.keys(entity.figure).length <= 0)    
                return false

            this.optionCloned = entity.figure;
            return true
        }

        this.draw = function(place, style) {
            // 清空重新画
            $(place).html("");

            /*
            var geojson_format = new ol.format.GeoJSON();
            var features = geojson_format.readFeatures(this.optionCloned, "FeatureCollection");  
            source.addFeatures(features);
            */

            var source = new ol.source.GeoJSON({
                'object':   this.optionCloned
            });

            var layer = new ol.layer.Vector({
                source:     source
            });

            var view = new ol.View({
                center:     [119.483545, 39.837984] 
                , zoom:     14
                , projection:   'EPSG:4326'
            });
            view.on("change:center", function() {
                console.log(view.getCenter());
                console.log(view.getZoom())
            })

            this.map = new ol.Map({
                'target':   place.id
                , 'layers':     [
                    layer
                ]
                , 'view':   view
            })

            /*
            var layers_num = this.map.getLayers().getLength();
            var if_base = layers_num > 0 ? false : true;
            */
        }

        this.getOption = function() {
            console.log('getOption')
        }

        this.getEc  = function() {
            console.log('getEc')
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
    var lineDrawer = new LineDrawer();
    AreaDrawer.prototype    = lineDrawer;
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



