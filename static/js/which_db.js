$modal_submit_btn = $("#list_link_db_modal").find(".list_link_db");


/*
// 点击某类别的数据库后，弹出数据库表单
$('#list_link_dbs .db').on('click', function(ev) {
	$('[name=kind]').val( $(ev.target).html() );
	
	$("#list_link_db_modal").modal("show");
});
*/

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


// 点击某类数据库后弹出数据库连接form
$('#list_link_dbs .db').on('click', function(ev) {
	$.ajax({
		url:		"/login/db"
		, type: 	"GET"
		, dataType:	"json"
		, success: 	onGetDbForm
		, error: function() {
		}
	})
});



//模态框确定事件
$('.list_link_db').on('click', function(ev) {
	/*
	$form = $("#conn_db_form");
	$form.submit()
	return false;
	*/

	/*
	$form.ajaxComplete( function(e, xhr, settings) {
		console.log("xxx")
	})
	*/

	var value = $(ev.target).attr("value");
	if("db" === value) {
		var formdata = $form.serialize();
		$.ajax({
			url:		"/login/db/"
			, type: 	"POST"
			, data:		formdata
			, success:  onGetTables
			, error: 	function() {
			}
		});
	} else {
		$form = $("#conn_db_form");
		$form.submit()
		return false;
	}
});

/*//数据库表选择事件
$("#list_link_db_modal #tables_list li").on('click',function(ev) {
	$(".table-choosed").removeClass('table-choosed');
	$(ev.target).addClass('table-choosed');
});*/

//模态框取消事件
$('.list_cancel_modal').on('click', function(ev) {
	$("#list_link_db_modal").modal("hide");
});


function renderForm(data, from) {
	$form  = $("#conn_db_form");
	$title = $("#list_link_db_modal").find(".modal-title")

	if ("db" === from) {
		$form.attr("action", "/login/db/");
		$form.html(data)
		$title.html("连接数据库");
		$modal_submit_btn.attr("value", "db")
	}
	else {
		$form.attr("action", "/login/tables/");
		$obj = $("<div id=tables_list></div>");

		$.each(data, function(idx, table) {
			var tableEle = "<input type='checkbox' name='table' value=__name__  />__name__"
																	.replace(/__name__/g, table);
			$obj.append(tableEle)
		})


		$form.html($obj)
		$title.html("选择数据表");
		$modal_submit_btn.attr("value", "table")
	}
}


function onGetDbForm(data) {
	if (data.succ) {
		$("#list_link_db_modal").modal("show");
		renderForm(data["data"], "db")
	} else {
		alert(data.msg)
	}
}


function onGetTables(data) {
	if (data.succ) {
		var tables = JSON.parse(data['data'])
		renderForm(tables, "table")
	} else {
		alert(data.msg)
	}
}


// 通过数据库验证后显示table列表
function showTables(tables) {
	$obj = $("<div id=tables_list></div>");
	$.each(tables, function(idx, table) {
		var tableEle = "<input type='checkbox' class='table' />__name__".replace("__name__", table);
		$obj.append(tableEle)
	})
	$("#conn_db_form").html($obj)
	//$(".table").on("click", chooseTable);
	$("#conn_db_form").hide();
	//$("#conn_table_form").append($obj)
	$(".table").on("click", chooseTable);
}


function chooseTable(ev) {
	var names = $(ev.target).html();
	var strNames = JSON.stringify([names]);

	/*
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
	*/
}







