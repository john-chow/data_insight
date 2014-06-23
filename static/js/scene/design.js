/*!
 * 场景设计界面JS
 *
 * Date: 2014-05-01
 */

var GRID_UNIT_WIDTH     = 50,
    GRID_UNIT_HEIGHT    = 50;
    

//初始化gridster
$(function(){ //DOM Ready
    $(".gridster ul").gridster({
        //widget_selector: "li",                        //确定哪个元素是widget
        widget_margins: [1, 1],                       //margin大小
        widget_base_dimensions: [GRID_UNIT_WIDTH, GRID_UNIT_HEIGHT],           //面积大小
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


// *************************
// 组织区域模块
// ************************

// 这里依赖是为了保证展示模块先加载，先启动监听事件
define("compontnents", ["display"], function(d) {
    // 所有可以用组建类构造函数
    var allWidgetsObj = {
        $el:                $("#all_widgets") ,
        widgetsList:        [],
        init:               function() {
            // 从dom树上抓取该区域内全部element，并且组合成widget对象
            // 保存widget对象为属性成员
            var self = this;
            $.each(this.$el.find(".scene_list_widget"), function(i, ele) {
                var widgetId        = $(ele).attr("data-id");
                var widgetName      = $(ele).attr("title");
                var widgetObj       = new CWidget(widgetId, widgetName);

                // 监听点击事件，以抓取图像数据的函数作回掉函数
                $(ele).on("click", function() {
                    var clonedWidget = cloneObject(widgetObj);

                    //时间戳，使相同widget有唯一class，用于删除
                    var timestamp = Date.now(); 
                    clonedWidget.setStmap(timestamp);

                    scnWidgetsObj.respToSelect(clonedWidget)
                })

                self.addWidget(widgetObj)
            })
        },

        addWidget:          function(widgetObj) {
            this.widgetsList.push(widgetObj)
        }
    };

    // 本场景属性设计类构造函数
    var myAttributesObj = {
        $el:                $("#scene_name"),
        init:               function() {
        },
        getName:            function() {
            this.name = $("#scene_name").val().trim();
            return this.name
        }
    };

    // 本场景组件类构造函数
    var scnWidgetsObj = {
        // 组件列表
        widgetsList:        [],

        // 对应dom节点
        $el:                $("#choosed_layout") ,

        // 组件列表中组件模板
        template:           '<li class="scene_choose_widget" id="wi_{widget_id_time}" ' 
                        + 'data-id="{widget_id}" data-time="{widget_time}">'
                        + '<i class="glyphicon glyphicon-stats"></i>'
                        + '&nbsp;{widget_name}<span class="glyphicon glyphicon-remove"></span>'
                        + '</li>',

        init:           function() {
            // 从dom树上抓取该区域内全部element，并且组合成widget对象
            // 模拟为被选中，加入本场景组件列表
            var self = this;
            $.each(this.$el.find(".widget_chosen_template"), function(i, ele) {
                var widgetId    = $(ele).attr("data-id");
                var widgetName  = $(ele).attr("title");
                var timeStamp   = $(ele).attr("data-time");
                var widgetObj   = new CWidget(widgetId, widgetName, timeStamp);
                self.respToSelect(widgetObj)
            })
            // 增加给每个组件的样式及事件
            $("#scene_widgets").on('mouseenter',".scene_choose_widget", function(ev) {
                data_id = $(this).attr("data-id");
                data_time = $(this).attr("data-time");
                var choose = "se_wi_"+data_id+"_"+data_time;
                $("."+choose).find(".se_wi_div").addClass("se_wi_color");
            });
            $("#scene_widgets").on('mouseleave',".scene_choose_widget", function(ev) {
                $(".se_wi_color").removeClass('se_wi_color')
            });
        },

        // 初始化dom样式等等
        initElements:   function() {
        },

        respToSelect:   function(widgetObj) {
            this.addWidget(widgetObj);

            // 向服务器请求图像数据
            widgetObj.fetchPicData()
        },

        addWidget:      function(widgetObj) {
            // 增加组件到dom
            var replaceId   = widgetObj.id+"_"+widgetObj.stamp;
            var $toAddedObj  = $(this.template.replace(/{widget_id_time}/g, replaceId)
                                    .replace(/{widget_time}/g, widgetObj.stamp)
                                    .replace(/{widget_id}/g, widgetObj.id)
                                    .replace(/{widget_name}/g, widgetObj.name));     
            this.$el.find("#scene_widgets").append($toAddedObj);

            //删除场景内某个组件
            $toAddedObj.find("span.glyphicon")
                        .on("click", bindContext(this.rmWidget, this));

            this.widgetsList.push(widgetObj)
        },

        rmWidget:       function(ev) {
            // 样式上删除
            $choose = $(ev.target).parent();
            data_id = $choose.attr("data-id");
            data_time = $choose.attr("data-time");
            var choose = "se_wi_"+data_id+"_"+data_time;
            $choose.remove();
            var gridster = $(".gridster ul").gridster().data('gridster');//获取对象
            gridster.remove_widget($("."+choose));
            
            // 数据中删除
            this.widgetsList = this.widgetsList.filter(function(w) {
                return (w.id !== data_id) || (w.stamp !== data_time)
            })
        },

        // 保存本场景组件列表
        getWidgetsDataForAjax:          function() {
            var widgetIdList    = $.map(this.widgetsList, function(wi) {
                return {"id": wi.id,    "stamp": wi.stamp}
            });

            return ( JSON.stringify(widgetIdList) )
        },

        restore:        function() {
        }
    };


    // 每个组件类构造函数
    var CWidget =     function(id, name, stamp) {
        // 组件id
        this.id     =           id;
        this.name   =           name || "组件";
        this.stamp  =           stamp || "";

        // 获取组件图像数据
        this.fetchPicData =     function() {
            var self = this;
            $.ajax({
                url:            "/widget/show/" + this.id + "/"
                , type:         "GET"
                , data:         {"scn_id":  window.scene_id}
                , dataType:     "json"
                , success:      self.onGetWidgetData 
                , error:        function() {}
                , context:      self
            })
        };

        this.onGetWidgetData =  function(data) {
            // 如果成功，则传递数据到面板进行画图
            if (data.succ){
                $body.trigger("show_widget"
                                , {"data":data, "time": this.stamp})
            } else {
                alert(data.msg)
            }
        };

        this.setStmap       =   function(stamp) {
            this.stamp  = stamp
        }
    };


    var skinObj         =   {
        $el:                    null,
        skinNumber:             null,

        init:               function() {
            //this.$el.find("").on("click", bindContext(this.rqSkinDetail, this))
            $body.on("test", bindContext(this.rqSkinDetail, this))
        },

        rqSkinDetail:         function(ev, data) {
            var self        =   this;
            var skinNumber  =   data;
            //var skinNumber      = $(ev.target).attr("skin_number");
            $.ajax({
                url:            "/skin/detail/scene/" + skinNumber     
                , type:         "GET"
                , dataType:     "json"
                , success:      function(resp) {
                    if (resp.succ) {
                        self.skinNumber = skinNumber;
                        self.cmdToChangeSkin(resp.data)
                    }
                }
                , error:        function() {}
            })
        },

        cmdToChangeSkin:        function(skinData) {
            $body.trigger("change_skin", skinData)            
        }

    };

    
    // 开始运行
    allWidgetsObj.init();
    scnWidgetsObj.init();
    myAttributesObj.init();
    skinObj.init();

    return {
        "aw":       allWidgetsObj
        , "sw":     scnWidgetsObj
        , "at":     myAttributesObj
        , "sn":     skinObj
    }
})




// *************************
// 呈现区域模块
// ************************
define("display", ["drawer"], function(DrawManager) {
    var display = {
        $el:                $("#scene_design_right"),
        $gridster:          $(".gridster ul"),
        drawerList:             [],             // 画图对象
        scnSkinData:        {},                 // 场景皮肤

        run:                    function() {
            this.init();
            this.startListener()
        },

        init:                   function() {
            var layoutStr   = this.$el.find(".layout").html(); 
            this.layoutArr = layoutStr ? JSON.parse(layoutStr) : null;

            var skinStr = $("#scn_data").html();
            this.scnSkinData    = (skinStr.trim().length > 0) ? JSON.parse(skinStr) : {}
        },
        
        startListener:          function() {
            $body.on("show_widget",     bindContext(this.showNewWidget, this));
            $body.on("try_skin",        bindContext(this.dressSkin, this));
            $body.on("change_skin",     bindContext(this.changeSkin, this));
        },

        dressSkin:             function(ev, skinData) {
            // 对本场景下的每个组件使用该样式
            var self = this;
            $.each(this.drawerList, function(i, obj) {
                var dataDraw = self.mixSkin2WiData(skinData, obj["wi_data"]);
                obj["dr"].getDrawer().start(dataDraw)
            })
        },

        changeSkin:             function(ev, skinData) {
            this.scnSkinData    = skinData;
            this.dressSkin(ev, this.scnSkinData)
        },

        showNewWidget:              function(ev, data) {
            var timestamp = data.time;
            var data = data.data;
            var gridster = $(".gridster ul").gridster().data('gridster');

            //利用时间戳
            var len = $(".se_wi_div_"+data.widget_id).length;
            var str =   "<li class='se_wi_"+data.widget_id+"_"+timestamp+
                        "' data-id='"+data.widget_id+"' data-time='"+timestamp+
                        "'><div id='se_"+timestamp+"' class='se_wi_div se_wi_div_"+
                        data.widget_id+"'></div></li>";
            var posObj  = this.sureShowPos(timestamp);
            gridster.add_widget(
                str
                , parseInt(posObj.size_x),  parseInt(posObj.size_y)
                , parseInt(posObj.col),     parseInt(posObj.row)
            );

            var wiData  =    data.data;
            var dataDraw = this.mixSkin2WiData(this.scnSkinData, wiData);
            var drawer = new DrawManager();
            drawer.run($(".se_wi_div_"+data.widget_id)[len], dataDraw);

            this.drawerList.push({"stamp": timestamp, "dr": drawer, "wi_data": wiData});

            this.afterWidgetShown(drawer, data.widget_id)
        },

        mixSkin2WiData:          function(skinData, data) {
            data["style"]  = data["style"] || {};
            $.extend(data["style"], skinData)
            return data
        },

        sureShowPos:                function(timestamp) {
            var defaultPos  = {
                "size_x": 10, "size_y": 5, "col": null, "row": null   
            };

            if(!this.layoutArr)        return defaultPos

            var mypos = this.layoutArr.filter(function(layout) {
                if (layout.data_time == timestamp)   return true
            })

            if (mypos && mypos.length > 0) {
                return mypos[0]
            } else {
                return defaultPos
            }
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

        getDisplayDataForAjax:      function() {
            var gridObj     = this.$gridster.gridster().data('gridster');
            var layoutArray = gridObj.serializeByStev();
            var image       = this.getSnapShot(layoutArray);
            return {
                "layout":       JSON.stringify(layoutArray)
                , "image":      image
            }
        },

        getSnapShot:           function(layoutArray)  {
            var len     = this.drawerList.length,
                maxRow  = 0,
                maxCol  = 0 ;

            var self = this;
            $.each(layoutArray, function(i, layout) {
                // 找最大的行和最大的列，用来确定快照的尺寸
                var rowUnitNum = layout.row - 1 + layout.size_y;
                var colUnitNum = layout.col - 1 + layout.size_x; 
                maxRow = (maxRow >= rowUnitNum) ? maxRow : rowUnitNum;
                maxCol = (maxCol >= colUnitNum) ? maxCol : colUnitNum;

                // 为每个grid单元保存它的canvas快照
                for(var j = 0; j < len; j++) {
                    if (self.drawerList[j].stamp == layout.data_time)  {
                        var ec = self.drawerList[j].dr.getEc();  
                        layout["canvas"] = ec.getZrender().toDataCanvas("");
                        break
                    }
                }
            })

            var width   = maxCol * GRID_UNIT_WIDTH;
            var height  = maxRow * GRID_UNIT_HEIGHT
            $newDom = $("<canvas width="+width+" height="+height+" style='position: absolute; left: 0px; top: 0px'>");
            var newDom = $newDom[0];
            var ctx = newDom.getContext("2d");
            $.each(layoutArray, function(i, layout) {
                var dy  = parseInt(layout.row - 1)  * GRID_UNIT_HEIGHT,
                    dx  = parseInt(layout.col - 1)  * GRID_UNIT_WIDTH;
                ctx.drawImage(layout.canvas, dx, dy);
            
                // 画到公共大面板之后移除画图对象
                delete layout["canvas"]
            })

            return newDom.toDataURL()
        }
    };

    // 启动
    display.run();

    return display
})


// *************************
// 整体区域
// ************************

define("whole", ["compontnents", "display", 'showmsg'], function(C, D, X) {
    var whole = {
        init:               function() {
            this.myAttributesObj = C.at;
            this.scnWidgetsObj  = C.sw;
            this.skinObj        = C.sn;
            this.display        = D;
            var self = this;
            $("#save_scene").on("click", function() {
                if(self.checkSave())        self.save()
            });
        },

        checkSave:         function() {
            // 必须要填写了场景名字
            if( !this.myAttributesObj.getName() )   {
                alert("请填写场景名称");
                return false
            }

            // 必须要有组件，没有组件地保存没有任何意义
            if( this.scnWidgetsObj.widgetsList.length <= 0) {
                alert("请选择组件");
                return false
            }

            return true
        },

        save:               function() {
            var displayObj      = this.display.getDisplayDataForAjax();          
            var widgetsStr      = this.scnWidgetsObj.getWidgetsDataForAjax();
            var name            = this.myAttributesObj.getName();
            var skinNumber      = this.skinObj.skinNumber;

            if (window.scene_id) 
                var url = "/scene/edit/" + window.scene_id + "/"
            else 
                var url = "/scene/create/"

            $.ajax({
                url:            url
                , type:         "POST"
                , dataType:     "json"
                , data:         {
                    "layout":           displayObj.layout
                    , "image":          displayObj.image 
                    , "widgets":        widgetsStr 
                    , "name":           name 
                    , "skin":           skinNumber
                }        
                , success:      function(data) {
                    window.scene_id = data.scn_id;
                    $(".show-msg").showmsg({
                    top: '55px',
                    left: '37%',
                    msg: data.msg,
                    delayTime: 1500
                 });
                }
                , error:        function() {
                }
            })
        }
    }

    whole.init();
})


require(["display", "compontnents", "whole"], function() {
})




