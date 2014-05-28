//初始化gridster
$(function(){ //DOM Ready
    $(".gridster ul").gridster({
        //widget_selector: "li",                        //确定哪个元素是widget
        widget_margins: [5, 5],                       //margin大小
        widget_base_dimensions: [500, 300],           //面积大小
        helper:'clone',
        autogrow_cols: true,
        resize: {
            enabled: true,
            start: function(e, ui, $widget) {
             
            },

            resize: function(e, ui, $widget) {
                //innerHTML = 'RESIZE offset: ' + ui.pointer.diff_top +' '+ ui.pointer.diff_left + "<br >";
                //console.log(innerHTML);
            },

            stop: function(e, ui, $widget) {
                innerHTML = '停止事件：' + ui.position.top +' '+ ui.position.left;
                console.log(innerHTML);
                $body.trigger("widget_resize_" + $widget.attr("data-id"))
            }
          }
        });

});

//初始化页面
window.onload = function (){
    changeAuto();
    $(window).resize(function() {
          changeAuto();
    });
}

//动态变化高度
function changeAuto() {
    var clientHeight = document.documentElement.clientHeight;
    var eHeight = $("#header").height()+$("#menu").height()+1;
    $("#scene_design_right").height(clientHeight-eHeight);
    $("#scene_design_left").height(clientHeight-eHeight);
    //alert(clientHeight+"_"+$("#header").height()+"_"+$("#menu").height()+"_"+$("#scene_design_left").height());
    $("#choosed_chart").height("40%");
    $("#choosed_dashboard").height("30%");
    $("#choosed_layout").height("30%");
    var headHeight = $("#choosed_chart .panel-heading").height()+7;
    var oHeight = $("#choosed_chart").height()-headHeight-$(".choosed_chart_extra").height();
    var tHeight = $("#choosed_dashboard").height()-headHeight;
    $("#choosed_chart ul").height(oHeight);
    $("#choosed_dashboard ul").height(tHeight);
    $("#choosed_layout ul").height(tHeight);
}


//测试函数
function sertest() {
    var gridster = $(".gridster ul").gridster().data('gridster');
    var json = gridster.serializeByStev();
    //sessionStorage.tempWorkBook = JSON.stringify(json);
    alert(JSON.stringify(json)); 
}

//测试函数
function outtest() {
    var gridster = $(".gridster ul").gridster().data('gridster');//获取对象
    var serialization=sessionStorage.tempWorkBook;
    gridster.remove_all_widgets();
    $.each(JSON.parse(serialization), function(i) {
        var st="<li data-id='"+this.data_id+"' class='gs-w'><div>id="+this.data_id+"</div></li>";
        gridster.add_widget(st, this.size_x, this.size_y, this.col, this.row);
    });
}

// 传递全局事件对象
$body = $("body");


// 组织区域模块
define("compontnents", [], function() {
    // 所有可以用组建类构造函数
    var allWidgetsObj = {
        $el:                null,
        widgetsList:        [],
        init:               function($el) {
            this.$el = $el;

            // 从dom树上抓取该区域内全部element，并且组合成widget对象
            // 保存widget对象为属性成员
            var self = this;
            $.each(this.$el.find(".scene_list_widget"), function(i, ele) {
                var widgetId        = $(ele).attr("data-id");
                var widgetName      = $(ele).attr("title");
                var widgetObj = new CWidget(widgetId, widgetName);

                // 监听点击事件，以抓取图像数据的函数作回掉函数
                $(ele).on("click", {"widget": widgetObj}
                                , bindContext(scnWidgetsObj.respToSelect, scnWidgetsObj));

                self.addWidget(widgetObj)
            })
        },

        addWidget:          function(widgetObj) {
            this.widgetsList.push(widgetObj)
        }
    };

    // 本场景属性设计类构造函数
    var myAttributesObj = {
        init:       function() {
        }
    };

    // 本场景组件类构造函数
    var scnWidgetsObj = {
        // 组件列表
        widgetsList:        [],

        // 对应dom节点
        $el:                "",

        // 组件列表中组件模板
        template:           '<li class="scene_choose_widget" id="wi_{widget_id_time}" ' 
                        + 'data-id="{widget_id}" data-time="{widget_time}">'
                        + '<i class="glyphicon glyphicon-stats"></i>'
                        + '&nbsp;{widget_name}<span class="glyphicon glyphicon-remove"></span>'
                        + '</li>',

        init:           function($el) {
            this.$el = $el;

            $body.on("scene_save", bindContext(this.save, this));
            
            // 从dom树上抓取该区域内全部element，并且组合成widget对象
            // 模拟为被选中，加入本场景组件列表
            var self = this;
            $.each(this.$el.find(".scene_list_widget"), function(i, ele) {
                var widgetObj = new CWidget($(obj).attr("data-id"));
                self.respToSelect({"data": widgetObj})
            })
        },

        // 初始化dom样式等等
        initElements:   function() {
        },

        respToSelect:   function(ev) {
            var widgetObj = ev.data["widget"];
            //时间戳，使相同widget有唯一class，用于删除
            var timestamp = Date.parse(new Date()); 
            this.addWidget(widgetObj,timestamp);

            $(".scene_choose_widget").on('mouseenter', function(ev) {
                data_id = $(this).attr("data-id");
                data_time = $(this).attr("data-time");
                var choose = "se_wi_"+data_id+"_"+data_time;
                $("."+choose).find(".se_wi_div").addClass("se_wi_color");
            });
            $(".scene_choose_widget").on('mouseleave', function(ev) {
                $(".se_wi_color").removeClass('se_wi_color')
            });
             $(".scene_choose_widget span.glyphicon").on('click', function(ev) {
                $choose = $(this).parent();
                data_id = $choose.attr("data-id");
                data_time = $choose.attr("data-time");
                var choose = "se_wi_"+data_id+"_"+data_time;
                $choose.remove();
                var gridster = $(".gridster ul").gridster().data('gridster');//获取对象
                gridster.remove_widget($("."+choose));
            });

            // 向服务器请求图像数据
            widgetObj.fetchPicData(timestamp)
        },

        addWidget:      function(widgetObj, timeStamp) {
            //var len = $(".se_wi_div_"+widgetObj.id).length;
            //var replaceId = widgetObj.id+"_"+len;
            var replaceId = widgetObj.id+"_"+timeStamp;
            this.$el.append(this.template.replace(/{widget_id_time}/g, replaceId)
                        .replace(/{widget_time}/g, timeStamp)
                                    .replace(/{widget_id}/g, widgetObj.id)
                                            .replace(/{widget_name}/g, widgetObj.name));
            this.widgetsList.push(widgetObj)
        },

        rmWidget:       function() {
        },

        // 保存本场景组件列表
        save:           function(ev, layoutArray) {
            var layoutStr       = JSON.stringify(layoutArray);
            var widgetIdList    = $.map(this.widgetsList, function(wi) {
                return wi.id
            });
            var widgetsIdStr  = JSON.stringify(widgetIdList);
            $.ajax({
                url:            "/scene/create/"
                , type:         "POST"
                , dataType:     "json"
                , data:         {
                    "layout":           layoutStr
                    , "widgets":        widgetsIdStr 
                }        
                , success:      function() {
                }
                , error:        function() {
                }
            })
        },

        restore:        function() {
        }
    };


    // 每个组件类构造函数
    var CWidget =     function(id, name) {
        // 组件id
        this.id     =           id;
        this.name   =           name;

        // 组件布局位置
        this.layout =           "", 
    
        // 获取组件图像数据
        this.fetchPicData =     function(timestamp) {
            var self = this;
            $.ajax({
                url:            "/widget/show/" + this.id + "/"
                , type:         "GET"
                , success:      function(data) {
                    self.onGetWidgetData(data, timestamp)
                }
                , error:        function() {}
            })
        };

        this.onGetWidgetData =  function(data, timestamp) {
            // 如果成功，则传递数据到面板进行画图
            if (data.succ){
                $body.trigger("show_widget", {"data":data, "time":timestamp})
            } else {
                alert(data.msg)
            }
        }
    };
    
    // 开始运行
    allWidgetsObj.init( $("#all_widgets") );
    scnWidgetsObj.init( $("#scene_widgets") );
    myAttributesObj.init();
})




// 呈现区域模块
define("display", ["drawer"], function(DrawManager) {
    var display = {
        $el:                $("#scene_design_right"),
        $gridster:          $(".gridster ul"),

        run:                function() {
            this.init();
            this.startListener()
        },

        init:          function() {
        },
        
        startListener:      function() {
            $body.on("show_widget",     bindContext(this.showWidget, this));
            $body.on("rm_widget",       bindContext(this.rmWidget, this));
            this.$el.find("#save_scene").on("click", bindContext(this.onSave, this));
        },

        showWidget:         function(ev, data) {
            var timestamp = data.time;
            var data = data.data;
            var gridster = $(".gridster ul").gridster().data('gridster');
            //利用时间戳
            len = $(".se_wi_div_"+data.widget_id).length;
            gridster.add_widget("<li class='se_wi_"+data.widget_id+"_"+timestamp+
                "' data-id='"+data.widget_id+"' data-time='"+timestamp+
                "'><div class='se_wi_div se_wi_div_"+
                data.widget_id+"'></div></li>", 1, 1);
            var drawer = new DrawManager();
            drawer.run($(".se_wi_div_"+data.widget_id)[len], data.data);

            this.afterWidgetShown(drawer, data.widget_id)
        },

        rmWidget:               function() {
        },

        keepFlexible:           function() {
            // 把所有相关标签的width,height设为100%
            // 只有某个div不需要去设置
            $.each(this.$el.find(".se_wi_div").find(":not(.echarts-dataview)"), function(i, obj) {
                $(obj).css("width", "100%");
                $(obj).css("height", "100%")
            })
        },

        afterWidgetShown:       function(drawer, widgetId) {
            // 保持伸缩性，拖到的时候也可以增大缩小
            this.keepFlexible();

            // 监听自己的resize事件
            $body.on("widget_resize_" + widgetId, {"drawer": drawer}
                                                , bindContext(this.onWidgetResize, this))
        },

        onWidgetResize:      function(ev) {
            var ec = ev.data.drawer.getEc();
            ec.resize();
            
            this.keepFlexible();
        },

        onSave:               function() {
            var gridObj     = this.$gridster.gridster().data('gridster');
            var layoutArray = gridObj.serializeByStev();
            $body.trigger("scene_save", layoutArray)
        },

        restore:            function() {
        }
    };

    // 启动
    display.run()
})


require(["compontnents", "display"], function() {
})

