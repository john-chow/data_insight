//初始化gridster
$(function(){ //DOM Ready
    $(".gridster ul").gridster({
      //widget_selector: "li",                        //确定哪个元素是widget
      widget_margins: [5, 5],                       //margin大小
      widget_base_dimensions: [150, 150],           //面积大小
      helper:'clone',
      autogrow_cols: true,
      resize:{
        enabled: true
      },
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
function changeAuto(){
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



// 组织区域模块
define("compontnents", [], function() {
    // 所有可以用组建类构造函数
    var allWidgetsObj = {
    };

    // 本场景属性设计类构造函数
    var myAttributesObj = {
    };

    // 本场景组件类构造函数
    var myWidgetsObj = {
        // 组件列表
        widgets:        [],

        // 组件布局
        layout:         "", 

        // 对应dom节点
        $el:            "",

        init:           function($el) {
            this.$el = $el;
            
            // 从dom树上抓取该区域内全部element，并且组合成widget对象
            // 保存widget对象为属性成员
            var self = this;
            $.each(this.$el.find(".widget"), function(i, ele) {
                var widgetObj = new OneWidget($(obj).attr("data-id"));

                // 监听拖动事件，以抓取图像数据的函数作回掉函数
                //

                self.allWidgetsObj.push(widgetObj)
            })
        },

        // 初始化dom样式等等
        initElements:   function() {
        },

        addWidget:      function(ev) {
        },

        rmWidget:       function() {
        },

        // 保存本场景组件列表
        save:           function() {
        },

        restore:        function() {
        },

        // 设置布局
        setLayout:      function(layout) {
            this.layout = layout
        }
    };


    // 每个组件类构造函数
    var OneWidget =     function(id, name) {
        // 组件id
        this.id     =           id;
        this.name   =           name;
   
        // 获取组件图像数据
        this.fetchPicData =     function() {
            $.ajax({
                url:        "/widget/" + wiId + "/"
                , type:     "GET"
                , success:  this.onGetWidgetData
                , error:    function() {}
            })
        };

        this.onGetWidgetData =  function() {

        }
    };
})




// 呈现区域模块
define("layout", [], function() {
})


define('', ["compontnents", "layout"], function() {
    require("compontnents");
    require("layout");
})

