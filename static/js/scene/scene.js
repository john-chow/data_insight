$(function(){ //DOM Ready
    $(".gridster ul").gridster({
      //widget_selector: "li",                        //确定哪个元素是widget
      widget_margins: [5, 5],                       //margin大小
      widget_base_dimensions: [140, 140],           //面积大小
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

function addWidget() {
    var gridster = $(".gridster ul").gridster().data('gridster');
    gridster.add_widget('<li class="new">The HTML of the widget...</li>', 2, 1);
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

    
    // 开始运行
    allWidgetsObj.init();
    myWidgetsObj.init();
    myAttributesObj.init();

})



// 呈现区域模块
define("layout", [], function() {
})


define('', ["compontnents", "layout"], function() {
    require("compontnents");
    require("layout");
})















