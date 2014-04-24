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
	$form = $("#conn_db_form");
	//$form.submit()
	/*
	$form.ajaxComplete( function(e, xhr, settings) {
		console.log("xxx")
	})
	*/

	var formdata = $form.serialize();
	$.ajax({
		url:		"/indb/"
		, type: 	"POST"
		, data:		formdata
		, success:  function(data) {
			var tables = JSON.parse(data['data'])
			showTables(tables)
		}
		, error: 	function() {
		}
	});
});

//模态框取消事件
$('.list_cancel_modal').on('click', function(ev) {
	$("#list_link_db_modal").modal("hide");
});

// 通过数据库验证后显示table列表
function showTables(tables) {
	$obj = $("<ul id=tables_list></ul>");
	$.each(tables, function(idx, table) {
		var tableEle = "<li class=table>__name__</li>".replace("__name__", table);
		$obj.append(tableEle)
	})
	$("#conn_db_form").replaceWith($obj)
	$(".table").on("click", chooseTable);
}


function chooseTable(ev) {
	var names = $(ev.target).html();
	var strNames = JSON.stringify([names]);

	$.ajax({
		url:		"/indb/choose/table"
		, type:		"POST"
		, data:		{
			table:	strNames
		}
		, success: function() {
			$("#list_link_db_modal").modal("hide")
		}
		, error: function(data) {
			alert(data.msg)
		}
	})
}







