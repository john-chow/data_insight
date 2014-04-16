requirejs([
 "jquery",
 "gridster",
 "design_main",
 "jqueryUi",
 "bootstrap",
], function($, g, MainView ,ui ,b) {
	new MainView;

    var MainRouter = Backbone.Router.extend({
        routes: {
			":dbname/$":         		'db_main_page'
			, ":dbname/(:p/)$":         'db_work_dash_page'
			, '*default': 				'default'
        }
    });

	// 启动router
	var router = new MainRouter();
    Backbone.history.start( { pushState: true} );

	router.on('route:db_main_page', function(p) {
	});

	router.on('route:db_work_dash_page', function(p) {
	});

	router.on('route:default', function() {
		alert('404')
	});


	//t.start();


	// 为所有属性增加id
	$.each( $("#mensions_list .mension, .measure"), function(i, obj) {
		$(obj).attr("id", "db_property_" + i)
	})


     //流动布局
     gridster = $(".gridster ul").gridster({
      //widget_selector: "li",                        //确定哪个元素是widget
      widget_margins: [5, 5],                       //margin大小
      widget_base_dimensions: [140, 140],           //面积大小
      helper:'clone',
      autogrow_cols: true,
      resize:{
        enabled: true
      },
    }).data('gridster');

/*
    //设置可自动排序
    $( "#column_sortable,#row_sortable" ).sortable({
        connectWith: ".connectedSortable",
        //revert: true,
        zIndex: "3000",
        //placeholder: "ui-state-highlight",
        cursor: "default",
        //所有的回调函数接受两个参数: 浏览器事件和ui对象
        start: function(event,ui) { //这个事件在排序开始时触发
            $(".dragging-custom").addClass("dragging-change-border");
            sessionStorage.dragContent=$(this).find("li").html();//把数据放在session 
          },
        sort: function(event,ui) {  //这个事件在排序时触发
			console.log('aaaaaa');
            
          },
        change: function(event,ui) { //这个事件在排序时触发,但是仅仅在对象在DOM中的位置改变时才会触发.
			console.log('aaaaaa');
           
          },
        beforeStop: function(event,ui) {  //这个事件在排序停止时触犯,但仅仅在placeholder/helper依然存在时触发.
			console.log('aaaaaa');
            
          },
        stop: function(event,ui) { //这个事件在排序停止时触发.
            $(".dragging-custom").removeClass("dragging-change-border");
			console.log('aaaaaa');
          },
        update: function(event,ui) { //这个事件在用户停止排序并且DOM节点位置发生改变时出发.
			console.log('aaaaaa');
           
          },
        receive: function(event,ui) { //这个时间在一个已连接的sortable接收到来自另一个列表的元素时触发.
			console.log('aaaaaa');
            
          },
        remove: function(event,ui) { //这个事件在sortable中的元素移除自身列表添加到另一个列表时触发.
			console.log('aaaaaa');
            
          },
        over: function(event,ui) { //这个事件在一个元素添加到连接列表中时触发.
			console.log('aaaaaa');
           
          },
        out: function(event,ui) { //这个事件在一个元素移除连接列表时触发.
			console.log('aaaaaa');
           
          },
        activate: function(event,ui) { //这个事件发生在使用连接列表,每个连接列表在拖动开始准备接受它时触发.
			console.log('aaaaaa');
           
          },
        deactivate: function(event,ui) { //这个事件发生在排序结束后,传播到所有可能的连接列表.
			console.log('aaaaaa');
           
          }
    }).disableSelection();;
	*/

	/*
    //设置可拖动
    $(".measure, .mension").draggable({
      connectToSortable: "#column_sortable ,#row_sortable",
      helper: "clone",
      scroll: "false",
      zIndex: "3000",
      //revert: "invalid",
      cursor: "default",
      helper: function( event ) {
        return $( "<li class='dragging-li ui-state-default'>"+ $(this).html()+"</li>" );
      },
      //所有的回调函数(start, stop, drag)接受两个参数: 浏览器事件和ui对象
      start: function(event,ui) {
        $(".dragging-custom").addClass("dragging-change-border");
      },
      drag: function(event,ui) {
        
      },
      stop: function(event,ui) {
       $(".dragging-custom").removeClass("dragging-change-border");
      }
    });
	*/

		/*
      //此代码删除了，触发不了drop，原因暂不明确
      this.$('#filter_conditions').droppable({
          drop: function(event, ui) {
          }
      });
		*/
   
    //自定义：先初始化高度和宽度；当屏幕大小改变时自适应改变高度宽度
    change_auto();
    $(window).resize(function() {
          change_auto();
    });
});

function change_auto(){
    change_dbinfo_bar();
    change_design_panel();
    change_show_area();
}

function change_dbinfo_bar(){
    $("#mensions_list").height(change_dbinfo_height());
    $("#measures_list").height(change_dbinfo_height());
}

function change_design_panel(){
    $("#column_sortable").width(change_line_width());
    $("#row_sortable").width(change_line_width());
    $("#design_panel").height(change_design_panel_height());
    $("#draw_panel").height(change_draw_panel_height());
    $("#draw_panel").width($("#row_sortable").width()+75);
    $("#design_panel").width(document.documentElement.clientWidth-161-3);
}

function change_show_area(){
    var clientHeight = document.documentElement.clientHeight;
    var logoHeight=$("#header").height();
    var menuHeight=$("#design_menu").height();
    var footerHeight=$("#footer").height()+1;     //border-top:1px
    var areaHeight = clientHeight-logoHeight-menuHeight-footerHeight;
    $("#show_area_bar").height(areaHeight);
    $("#show_area_panel").height(areaHeight);
    $("#show_area_chart").height(areaHeight-28);//28是info_workplace高度
}

 function change_dbinfo_height(){
    var clientHeight = document.documentElement.clientHeight;
    var logoHeight=$("#header").height();
    var menuHeight=$("#design_menu").height();
    var dbHeight=$("#using_db_name").height();
    var footerHeight=$("#footer").height()+1;     //border-top:1px
    var titleHeight=$("#dimensions .panel-heading").height()+1+6; //border-bottom:1px,padding:3px 15px
    return (clientHeight-logoHeight-menuHeight-dbHeight-footerHeight)/2-titleHeight-10;  //padding:10px 0 0 0         
}

function change_line_width(){
    var clientWidth = document.documentElement.clientWidth;
    var barWidth = $("#dbinfo_bar").width()+1; //border-right:1px 默认161px 
    var boxWidth = $("#filter_box").width();
    clientWidth=clientWidth-boxWidth-161-3-2-1-75-10;//margin: 3px 0 3px 3px;border:1px;border-right: 1px;width: 75px;
    return clientWidth;
}

function change_design_panel_height(){
    var clientHeight = document.documentElement.clientHeight;
    var logoHeight=$("#header").height();
    var menuHeight=$("#design_menu").height();
    var footerHeight=$("#footer").height();
    clientHeight=clientHeight-logoHeight-menuHeight-footerHeight-2;//2个border
    return clientHeight;
}

function change_draw_panel_height(){
    var drawplotsHeight = $("#draw_plots").height();
    var infoWorkplaceHegiht = $("#info_workplace").height();
    return  change_design_panel_height()-drawplotsHeight-infoWorkplaceHegiht-25;//margin: 3px 0 3px 3px;margin-bottom: 12px;
}
