requirejs([
 "jquery", 
 "main",
 "jqueryUi",
 "bootstrap",
 "underscore", 
 'test'
], function($, MainView ,ui ,b ,_, t) {
    new MainView;

	t.start();

   // 颜色板
     $('.colorBoard').each( function() {
        $(this).minicolors({
          control: $(this).attr('data-control') || 'hue',
          defaultValue: $(this).attr('data-defaultValue') || '',
          inline: $(this).attr('data-inline') === 'true',
          letterCase: $(this).attr('data-letterCase') || 'lowercase',
          opacity: $(this).attr('data-opacity'),
          position: $(this).attr('data-position') || 'bottom left',
          change: function(hex, opacity) {
            if( !hex ) return;
            if( opacity ) hex += ', ' + opacity;
            try {
            } catch(e) {}
          },
          theme: 'bootstrap'
        });
                
    });

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
            
          },
        change: function(event,ui) { //这个事件在排序时触发,但是仅仅在对象在DOM中的位置改变时才会触发.
           
          },
        beforeStop: function(event,ui) {  //这个事件在排序停止时触犯,但仅仅在placeholder/helper依然存在时触发.
            
          },
        stop: function(event,ui) { //这个事件在排序停止时触发.
            $(".dragging-custom").removeClass("dragging-change-border");
          },
        update: function(event,ui) { //这个事件在用户停止排序并且DOM节点位置发生改变时出发.
           
          },
        receive: function(event,ui) { //这个时间在一个已连接的sortable接收到来自另一个列表的元素时触发.
            
          },
        remove: function(event,ui) { //这个事件在sortable中的元素移除自身列表添加到另一个列表时触发.
            
          },
        over: function(event,ui) { //这个事件在一个元素添加到连接列表中时触发.
           
          },
        out: function(event,ui) { //这个事件在一个元素移除连接列表时触发.
           
          },
        activate: function(event,ui) { //这个事件发生在使用连接列表,每个连接列表在拖动开始准备接受它时触发.
           
          },
        deactivate: function(event,ui) { //这个事件发生在排序结束后,传播到所有可能的连接列表.
           
          }
    }).disableSelection();;

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

      //此代码删除了，触发不了drop，原因暂不明确
      this.$('#filter_conditions').droppable({
          drop: function(event, ui) {
          }
      });
   
    //自定义：先初始化高度和宽度；当屏幕大小改变时自适应改变高度宽度
    change_auto();
    $(window).resize(function() {
          change_auto();
    });
});

function change_auto(){
    change_dbinfo_bar();
    change_design_panel();
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
    var barWidth = $("#dbinfo_bar").width()+1; //border-right:1px 
    var boxWidth = $("#filter_box").width();
    clientWidth=clientWidth-boxWidth-barWidth-3-2-1-75;//margin: 3px 0 3px 3px;border:1px;border-right: 1px;width: 75px;
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
