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


/*
// 点击已被允许使用的组件时，请求拿到组件chart图的数据
$(".scene_list_widget").on("click", function(ev) {
    var wiId = $(this).attr("data-id");
    $.ajax({
        url:        "/widget/show/" + wiId + "/"
        , type:     "GET"
        , dataType: "json"
        , success:  onGetWidgetData
        , error:    function() {}
    })
    
})

//ajax成功后执行函数
var onGetWidgetData = function(data) {
    require(["drawer"], function(DrawManager) {
        if (data.succ){
            var gridster = $(".gridster ul").gridster().data('gridster');
            gridster.add_widget("<li class='se_wi_"+data.data_id+"' data-id='"+data.data_id+"'></li>", 1, 1);
            var drawer = new DrawManager();
            var len = $(".se_wi_"+data.data_id).length-1;
            drawer.run($(".se_wi_"+data.data_id)[len], data['data'])
            //alert(data['data']);
        } else {
            alert(data.msg)
        }
    })
}
*/



//测试函数
function sertest() {
    var gridster = $(".gridster ul").gridster().data('gridster');
    var json = gridster.serializeByStev();
    sessionStorage.tempWorkBook = JSON.stringify(json);
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
        template:           '<li class="scene_list_widget" id="wi_{widget_id}" ' 
                        + 'data-id={widget_id} title="{widget_name}">'
                        + '<i class="glyphicon glyphicon-stats"></i>'
                        + '&nbsp;{widget_name}</li>',

        init:           function($el) {
            this.$el = $el;
            
            // 从dom树上抓取该区域内全部element，并且组合成widget对象
            // 模拟为被选中，加入本场景组件列表
            var self = this;
            $.each(this.$el.find(".scene_list_widget"), function(i, ele) {
                var widgetObj = new CWidget($(obj).attr("data-id"));
                var ev = {"data": widgetObj};
                self.respToSelect(ev)
            })
        },

        // 初始化dom样式等等
        initElements:   function() {
        },

        respToSelect:   function(ev) {
            var widgetObj = ev.data["widget"];
            this.addWidget(widgetObj);

            // 向服务器请求图像数据
            widgetObj.fetchPicData()
        },

        addWidget:      function(widgetObj) {
            this.$el.find("#scene_widgets")
                    .append(this.template.replace(/{widget_id}/g, widgetObj.id)
                                        .replace(/{widget_name}/g, widgetObj.name));
            this.widgetsList.push(widgetObj)
        },

        rmWidget:       function() {
        },

        // 保存本场景组件列表
        save:           function() {
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
        this.fetchPicData =     function() {
            $.ajax({
                url:            "/widget/show/" + this.id + "/"
                , type:         "GET"
                , success:      this.onGetWidgetData
                , error:        function() {}
            })
        };

        this.onGetWidgetData =  function(data) {
            // 如果成功，则传递数据到面板进行画图
            if (data.succ){
                $body.trigger("show_widget", data)
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
        $el:                null,

        run:                function() {
            this.initStyle();
            this.startListener()
        },

        initStyle:          function() {
        },
        
        startListener:      function() {
            $body.on("show_widget",     bindContext(this.showWidget, this));
            $body.on("rm_widget",       this.rmWidget);
        },

        showWidget:         function(ev, data) {
            var gridster = $(".gridster ul").gridster().data('gridster');
            gridster.add_widget("<li class='se_wi_"+data.widget_id+"' data-id='"+data.widget_id+
                "'><div class='se_wi_div se_wi_div_"+data.widget_id+"'></div></li>", 1, 1);
            var drawer = new DrawManager();
            var len = $(".se_wi_div_"+data.widget_id).length-1;
            drawer.run($(".se_wi_div_"+data.widget_id)[len], data.data)
        },

        rmWidget:           function() {
        }
    };

    // 启动
    display.run()
})


require(["compontnents", "display"], function() {
})

