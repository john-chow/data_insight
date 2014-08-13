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
        var variable, clientHeight, leaveHeight;

    	//屏幕高度
    	clientHeight = document.documentElement.clientHeight;

    	//要自适应的高度（即去掉header,menu,operate,info的高度）,可得section的高度
        variable = $("#logo").outerHeight()+$("#menu").outerHeight()+
            $("#operate_region").outerHeight()+$("#info").outerHeight();
        leaveHeight = clientHeight-variable;

    	//设置data的高度
    	$("#table_region").height(leaveHeight*0.3);
    	$("#field_region").height(leaveHeight*0.7);

    	//设置area的高度
    	//$("#design_region").height((leaveHeight-$("#switch_region").outerHeight())*0.3);
        //console.log(leaveHeight+"___"+$("#switch_region").outerHeight(true)+"___"+$("#design_region").outerHeight());
    	$("#show_region").height(leaveHeight-$("#switch_region").outerHeight(true)-162-10-2-2);

        //设置table_template_content的高度
        variable = $("#table_region").outerHeight()-$("#table_template_header").outerHeight()
        $("#table_template_content").height(variable);

        //设置field_template_content的高度
        variable = $("#field_region").outerHeight()-$("#field_template_header").outerHeight()
        $("#field_template_content").height(variable);
    }
});

