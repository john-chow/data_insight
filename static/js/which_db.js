// 点击某类别的数据库后，弹出数据库表单
$('#list_link_dbs .db').on('click', function(ev) {
	$('[name=kind]').val( $(ev.target).html() );
	
	$("#list_link_db_modal").modal("show");
});

//连接数据库的动态切换
$("#list_link_to_db_head").on('click', function(ev) {
	if($("#list_link_dbs").css("display")=="none"){
		$("#list_link_dbs").slideDown("normal");
		$("#list_link_to_db_head span").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
	}
	else{
		$("#list_link_dbs").slideUp("normal");
		$("#list_link_to_db_head span").addClass("glyphicon-chevron-right").removeClass("glyphicon-chevron-down");
	}
});

//模态框确定事件
$('.list_link_db').on('click', function(ev) {
	$("#conn_db_form").submit();
});

//模态框取消事件
$('.list_cancel_modal').on('click', function(ev) {
	$("#list_link_db_modal").modal("hide");
});


