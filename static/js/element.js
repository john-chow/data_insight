// 点击新建组件时弹出模态框
$('#button_new_widget').on('click', function(ev) {
	//$("#conn_db_form").html("");
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

//点击widget的查找按钮事件
$("#widget_button_search").on('click', function(ev) {
	$("#widget_submit_search").val($("#widget_input_search").val());
	$("#widget_submit_page").val("");
	$("#widget_search_form").submit();
});

//点击widget的时间升序事件
$("#widget_sort_rise").on('click', function(ev) {
	$("#widget_submit_sort").val("1");
	$("#widget_search_form").submit();
});

//点击widget的时间降序事件
$("#widget_sort_drop").on('click', function(ev) {
	$("#widget_submit_sort").val("-1");
	$("#widget_search_form").submit();
});

//某个组件的操作(改变发布状态，删除等)
$(".widget_operate").on('click', function(ev) {
	if($(this).attr("data-op")=="delete"){
		$("#widget_post_form").attr("action", "/widget/delete/");
		if(!confirm("确定要删除吗？"))
			return;
	}
	else
		$("#widget_post_form").attr("action", "/widget/distr/");
	id = $(this).parents(".element-list-widget").attr("data-id");
	page = $("#list_page").val();
	
	$("#widget_post_id").val(id);
	$("#widget_post_page").val(page);

	$("#widget_post_form").submit();
});

//跳转页面组件批量操作页面
$("#button_widget_batch").on('click', function(ev) {
	page = $("#list_page").val();
	sort = $("#list_sort").val();
	search = $("#list_search").val();
	location.href = "/widget/batch/?page="+page+"&search="+search+"&sort="+sort;
});

//组件批量操作返回
$("#batch_list_back").on('click', function(ev) {
	page = $("#list_page").val();
	sort = $("#list_sort").val();
	search = $("#list_search").val();
	location.href = "/widget/list/?page="+page+"&search="+search+"&sort="+sort;
});

//组件查询返回
$("#widget_list_back").on('click', function(ev) {
	page = $("#list_page").val();
	sort = $("#list_sort").val();
	location.href = "/widget/list/?page="+page+"&sort="+sort;
});

//批量操作通用函数
function batch_widget_op() {
	var arr = new Array();
	$(".batch-widget-select").each(function(){
		id=$(this).attr("data-id");
		arr.push(id);
	});
	if(arr.length==0){
		alert("请选择组件!");
		return;
	}
	$("#widget_batch_list").val(arr);
	$("#widget_batch_form").submit();
}

//组件批量发布
$("#batch_widget_distri").on('click', function(ev) {
	$("#widget_batch_form").attr("action","/widget/batch/distri/");
	batch_widget_op();
});

//组件批量取消发布
$("#batch_widget_undistri").on('click', function(ev) {
	$("#widget_batch_form").attr("action","/widget/batch/undistri/");
	batch_widget_op();
});

//组件批量删除
$("#batch_widget_delete").on('click', function(ev) {
	$("#widget_batch_form").attr("action","/widget/batch/delete/");
	batch_widget_op();
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
	$innerFrom = $("#db_form_inner");
	$title = $("#db_link_modal").find(".modal-title")

	if ("db" === from) {
		$form.attr("action", "/widget/db/");
		$innerFrom.html(data)
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


		$innerFrom.html($obj)
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