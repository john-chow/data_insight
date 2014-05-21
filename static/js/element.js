// 点击新建组件时弹出模态框
$('#button_new_widget').on('click', function(ev) {
	$("#conn_db_form").html("");
	$("#db_link_modal").modal("show");
	$("#modal_choose_db").show();

});

//模态框取消事件
$('.button_cancel_modal').on('click', function(ev) {
	$("#db_link_modal").modal("hide");
});

//新建场景绑定事件，跳转页面
$("#button_new_scene").on('click', function(ev) {
	location.href = "/scene/create";
});

//组件批量操作，跳转页面
$("#button_widget_batch").on('click', function(ev) {
	page = $("#ownpage").val();
	location.href = "/widget/batchList/?page="+page;
});

//组件批量操作返回
$("#batch_list_back").on('click', function(ev) {
	page = $("#ownpage").val();
	location.href = "/widget/list/?page="+page;
});


//组件批量操作选中与取消
$("#batch_widget_list .element-list-div").on('click', function(ev) {
	if($(this).hasClass("batch-widget-select")){
		$(this).removeClass('batch-widget-select');
		countSelect();
	}
	else{
		$(this).addClass('batch-widget-select');
		countSelect();
	}
});

//统计选中组件个数
function countSelect(){
	var num = $(".batch-widget-select").length;
	$(".content-menu-count span").html(num);
}

//组件批量操作选中全部
$("#batch_widget_all").on('click', function(ev) {
	$(".element-list-div").addClass('batch-widget-select');
	countSelect();
});

//组件批量操作取消全部
$("#batch_widget_none").on('click', function(ev) {
	$(".element-list-div").removeClass('batch-widget-select');
	countSelect();
});

//选择数据库事件
$('#list_link_dbs .db').on('click', function(ev) {
	$.ajax({
		url:		"/widget/db"
		, type: 	"GET"
		, dataType:	"json"
		, success: 	onGetDbForm
		, error: function() {
		}
	})
});

//组件List中组件右上角按钮单击事件
$(".js-mod-widget-ico").on('click', function(ev) {
	$(ev.target).parent().siblings(".js-mod-widget-con").slideToggle('fast');
}); 

//组件List中，鼠标移开时隐藏
$(".element-list-widget").on('mouseleave', function(ev) {
	$(".js-mod-widget-con").hide();
});


//自定义模态框内容显示函数
function renderForm(data, from) {
	$("#modal_choose_db").hide();
	$modal_submit_btn = $("#db_link_modal").find(".list_link_db");
	$form  = $("#conn_db_form");
	$title = $("#db_link_modal").find(".modal-title")

	if ("db" === from) {
		$form.attr("action", "/widget/db/");
		$form.html(data)
		$title.html("连接数据库");
		$modal_submit_btn.attr("value", "db")
	}
	else {
		$form.attr("action", "/widget/tables/");
		$obj = $("<div id=tables_list></div>");

		$.each(data, function(idx, table) {
			var tableEle = "<div class='table-div'><input type='checkbox' name='table' value=__name__  />__name__"
																	.replace(/__name__/g, table);
			$obj.append(tableEle)
		})


		$form.html($obj)
		$title.html("选择数据表");
		$modal_submit_btn.attr("value", "table")

		//选择数据表
		$(".table-div").on('click', function(ev) {
			if($(this).find("input").attr("checked")) {
				$(this).find("input").removeAttr("checked"); 
			}
			else {
				$(this).find("input").attr("checked",true); 
				$(this).find("input").prop('checked',true);
			}
		});
	}
}


//模态框确定事件
$('.list_link_db').on('click', function(ev) {
	var value = $(ev.target).attr("value");
	if("db" === value) {
		var formdata = $form.serialize();
		$.ajax({
			url:		"/widget/db/"
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

//ajax成功后执行函数
function onGetDbForm(data) {
	if (data.succ) {
		renderForm(data["data"], "db")
	} else {
		alert(data.msg)
	}
}

//ajax成功后执行函数
function onGetTables(data) {
	if (data.succ) {
		var tables = JSON.parse(data['data'])
		renderForm(tables, "table")
	} else {
		alert(data.msg)
	}
}