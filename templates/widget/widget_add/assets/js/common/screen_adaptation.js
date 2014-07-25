/*!
 * 自适应屏幕
 * Date: 2014-7-25
 */
define([
	'jquery'
], function ( $ ) {

	screen_adaptation();
    $(window).resize(function() {
          screen_adaptation();
    });

    function screen_adaptation(){

    	//屏幕高度
    	var clientHeight = document.documentElement.clientHeight;

    	//要自适应的高度（即去掉header,menu,operate,info的高度）,section的高度
    	var leaveHeight = clientHeight-25-52-40-15;

    	//设置data的高度
    	$("#table_region").height(leaveHeight*0.3);
    	$("#field_region").height(leaveHeight*0.7);

    	//设置area的高度
    	$("#design_region").height((leaveHeight-35)*0.3);
    	$("#show_region").height((leaveHeight-35)*0.7);
    }
});

