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

// 本场景组件类构造函数
var MyWidgets = function() {
    // 组件列表
    this.widgets = [];

    // 组件布局
    this.layout = ""; 

    // 场景id
    this.id = "";

    this.init = function() {
        // 主要是适用于edit页面，去我的组件框中抓取
    };

    // 保存本场景组件列表
    this.save = function() {
    };

    // 设置布局
    this.setLayout = function(layout) {
        this.layout = layout
    }
}


var myWidgets = new MyWidgets();



// 点击已被允许使用的组件时，请求拿到组件chart图的数据
$(".scene_list_widget").on("click", function(ev) {
    var wiId = $(this).attr("data-id");
    var title = $(this).attr("title");
  /*  $.ajax({
        url:        "/widget/" + wiId + "/"
        , type:     "GET"
        , success:  onGetWidgetData
        , error:    function() {}
    })*/
    addWidget(wiId,title);
})

var onGetWidgetData = function(resp) {
    if(!resp.succ) {
        //
        return
    }
}


function addWidget(wiId,title) {
    var gridster = $(".gridster ul").gridster().data('gridster');
    gridster.add_widget("<li data-id='"+wiId+"'>"+title+"</li>", 1, 1);
}

function sertest() {
    var gridster = $(".gridster ul").gridster().data('gridster');
    var json = gridster.serializeByStev();
    alert(JSON.stringify(json)); 
}

function outtest() {
    
}
