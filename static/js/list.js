/*!
 * 此JS分为三部分
 * 第一部分为组件List页面
 * 第二部分为场景List页面
 * 第三部分为主题List页面
 *
 * Date: 2014-05-01
 */

$(function(){
	/*********************************************************************************/
	/*****************************第一部分：组件List**********************************/
	/*********************************************************************************/

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
	$("#batch_widget_back").on('click', function(ev) {
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
		var isSeleceAll = $(".element-list-div").length == $(".batch-widget-select").length;
		$("#batch_widget_all").prop("checked",isSeleceAll);//全选

	});

	//统计选中组件个数
	function countSelect(){
		var num = $(".batch-widget-select").length;
		$(".content-menu-count span").html(num);
	}

	//组件批量操作选中全部
	$("#batch_widget_all").on('click', function(ev) {
		var $selectCheckBox = $(ev.target);
		if($selectCheckBox.is(":checked")){
			$(".element-list-div").addClass('batch-widget-select');
		}else{
			$(".element-list-div").removeClass('batch-widget-select');
		}
		
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

	/*********************************************************************************/
	/*****************************第二部分：场景List**********************************/
	/*********************************************************************************/

	//新建场景绑定事件，跳转页面
	$("#button_new_scene").on('click', function(ev) {
		location.href = "/scene/create";
	});

	//跳转页面场景批量操作页面
	$("#button_scene_batch").on('click', function(ev) {
		page = $("#list_page").val();
		sort = $("#list_sort").val();
		search = $("#list_search").val();
		location.href = "/scene/batch/?page="+page+"&search="+search+"&sort="+sort;
	});

	//场景批量操作返回
	$("#batch_scene_back").on('click', function(ev) {
		page = $("#list_page").val();
		sort = $("#list_sort").val();
		search = $("#list_search").val();
		location.href = "/scene/list/?page="+page+"&search="+search+"&sort="+sort;
	});

	//点击scene的查找按钮事件
	$("#scene_button_search").on('click', function(ev) {
	    $("#scene_submit_search").val($("#scene_input_search").val());
	    $("#scene_submit_page").val("");
	    $("#scene_search_form").submit();
	});

	//点击scene的时间升序事件
	$("#scene_sort_rise").on('click', function(ev) {
	    $("#scene_submit_sort").val("1");
	    $("#scene_search_form").submit();
	});

	//点击scene的时间降序事件
	$("#scene_sort_drop").on('click', function(ev) {
	    $("#scene_submit_sort").val("-1");
	    $("#scene_search_form").submit();
	});

	//某个场景的操作(改变发布状态，删除等)
	$(".scene_operate").on('click', function(ev) {
	    if($(this).attr("data-op")=="delete"){
	        $("#scene_post_form").attr("action", "/scene/delete/");
	        if(!confirm("确定要删除吗？"))
	            return;
	    }
	    else
	        $("#scene_post_form").attr("action", "/scene/distr/");
	    id = $(this).parents(".element-list-scene").attr("data-id");
	    page = $("#list_page").val();
	    
	    $("#scene_post_id").val(id);
	    $("#scene_post_page").val(page);

	    $("#scene_post_form").submit();
	});

	//场景查询返回
	$("#scene_list_back").on('click', function(ev) {
	    page = $("#list_page").val();
	    sort = $("#list_sort").val();
	    location.href = "/scene/list/?page="+page+"&sort="+sort;
	});

	//批量操作通用函数
	function batch_scene_op() {
	    var arr = new Array();
	    $(".batch-scene-select").each(function(){
	        id=$(this).attr("data-id");
	        arr.push(id);
	    });
	    if(arr.length==0){
	        alert("请选择场景!");
	        return;
	    }
	    $("#scene_batch_list").val(arr);
	    $("#scene_batch_form").submit();
	}


	//场景批量发布
	$("#batch_scene_distri").on('click', function(ev) {
	    $("#scene_batch_form").attr("action","/scene/batch/distri/");
	    batch_scene_op();
	});

	//场景批量取消发布
	$("#batch_scene_undistri").on('click', function(ev) {
	    $("#scene_batch_form").attr("action","/scene/batch/undistri/");
	    batch_scene_op();
	});

	//场景批量删除
	$("#batch_scene_delete").on('click', function(ev) {
	    $("#scene_batch_form").attr("action","/scene/batch/delete/");
	    batch_scene_op();
	});


	//场景批量操作选中与取消
	$("#batch_scene_list .element-list-div").on('click', function(ev) {
	    if($(this).hasClass("batch-scene-select")){
	        $(this).removeClass('batch-scene-select');
	        countSelect();
	    }
	    else{
	        $(this).addClass('batch-scene-select');
	        countSelect();
	    }
	    var isSeleceAll = $(".element-list-div").length == $(".batch-scene-select").length;
	    $("#batch_scene_all").prop("checked",isSeleceAll);//全选

	});

	//统计选中场景个数
	function countSelect(){
	    var num = $(".batch-scene-select").length;
	    $(".content-menu-count span").html(num);
	}

	//场景批量操作选中全部
	$("#batch_scene_all").on('click', function(ev) {
	    var $selectCheckBox = $(ev.target);
	    if($selectCheckBox.is(":checked")){
	        $(".element-list-div").addClass('batch-scene-select');
	    }else{
	        $(".element-list-div").removeClass('batch-scene-select');
	    }
	    
	    countSelect();
	});

	//场景批量操作取消全部
	$("#batch_scene_none").on('click', function(ev) {
	    $(".element-list-div").removeClass('batch-scene-select');
	    countSelect();
	});


	//场景List中场景右上角按钮单击事件
	$(".js-mod-scene-ico").on('click', function(ev) {
	    $(ev.target).parent().siblings(".js-mod-scene-con").slideToggle('fast');
	}); 

	//场景List中，鼠标移开时隐藏
	$(".element-list-scene").on('mouseleave', function(ev) {
	    $(".js-mod-scene-con").hide();
	});

	/*********************************************************************************/
	/*****************************第三部分：主题List**********************************/
	/*********************************************************************************/

	//新建主题绑定事件，跳转页面
	$("#button_new_theme").on('click', function(ev) {
		location.href = "/theme/create";
	});


	//跳转页面主题批量操作页面
	$("#button_theme_batch").on('click', function(ev) {
		page = $("#list_page").val();
		sort = $("#list_sort").val();
		search = $("#list_search").val();
		location.href = "/theme/batch/?page="+page+"&search="+search+"&sort="+sort;
	});

	//主题批量操作返回
	$("#batch_theme_back").on('click', function(ev) {
		page = $("#list_page").val();
		sort = $("#list_sort").val();
		search = $("#list_search").val();
		location.href = "/theme/list/?page="+page+"&search="+search+"&sort="+sort;
	});

	//点击theme的查找按钮事件
	$("#theme_button_search").on('click', function(ev) {
	    $("#theme_submit_search").val($("#theme_input_search").val());
	    $("#theme_submit_page").val("");
	    $("#theme_search_form").submit();
	});

	//点击theme的时间升序事件
	$("#theme_sort_rise").on('click', function(ev) {
	    $("#theme_submit_sort").val("1");
	    $("#theme_search_form").submit();
	});

	//点击theme的时间降序事件
	$("#theme_sort_drop").on('click', function(ev) {
	    $("#theme_submit_sort").val("-1");
	    $("#theme_search_form").submit();
	});

	//某个主题的操作(改变发布状态，删除等)
	$(".theme_operate").on('click', function(ev) {
	    if($(this).attr("data-op")=="delete"){
	        $("#theme_post_form").attr("action", "/theme/delete/");
	        if(!confirm("确定要删除吗？"))
	            return;
	    }
	    else
	        $("#theme_post_form").attr("action", "/theme/distr/");
	    id = $(this).parents(".element-list-theme").attr("data-id");
	    page = $("#list_page").val();
	    
	    $("#theme_post_id").val(id);
	    $("#theme_post_page").val(page);

	    $("#theme_post_form").submit();
	});

	//主题查询返回
	$("#theme_list_back").on('click', function(ev) {
	    page = $("#list_page").val();
	    sort = $("#list_sort").val();
	    location.href = "/theme/list/?page="+page+"&sort="+sort;
	});

	//批量操作通用函数
	function batch_theme_op() {
	    var arr = new Array();
	    $(".batch-theme-select").each(function(){
	        id=$(this).attr("data-id");
	        arr.push(id);
	    });
	    if(arr.length==0){
	        alert("请选择主题!");
	        return;
	    }
	    $("#theme_batch_list").val(arr);
	    $("#theme_batch_form").submit();
	}


	//主题批量发布
	$("#batch_theme_distri").on('click', function(ev) {
	    $("#theme_batch_form").attr("action","/theme/batch/distri/");
	    batch_theme_op();
	});

	//主题批量取消发布
	$("#batch_theme_undistri").on('click', function(ev) {
	    $("#theme_batch_form").attr("action","/theme/batch/undistri/");
	    batch_theme_op();
	});

	//主题批量删除
	$("#batch_theme_delete").on('click', function(ev) {
	    $("#theme_batch_form").attr("action","/theme/batch/delete/");
	    batch_theme_op();
	});


	//主题批量操作选中与取消
	$("#batch_theme_list .element-list-div").on('click', function(ev) {
	    if($(this).hasClass("batch-theme-select")){
	        $(this).removeClass('batch-theme-select');
	        countSelect();
	    }
	    else{
	        $(this).addClass('batch-theme-select');
	        countSelect();
	    }
	    var isSeleceAll = $(".element-list-div").length == $(".batch-theme-select").length;
	    $("#batch_theme_all").prop("checked",isSeleceAll);//全选

	});

	//统计选中主题个数
	function countSelect(){
	    var num = $(".batch-theme-select").length;
	    $(".content-menu-count span").html(num);
	}

	//主题批量操作选中全部
	$("#batch_theme_all").on('click', function(ev) {
	    var $selectCheckBox = $(ev.target);
	    if($selectCheckBox.is(":checked")){
	        $(".element-list-div").addClass('batch-theme-select');
	    }else{
	        $(".element-list-div").removeClass('batch-theme-select');
	    }
	    
	    countSelect();
	});

	//主题批量操作取消全部
	$("#batch_theme_none").on('click', function(ev) {
	    $(".element-list-div").removeClass('batch-theme-select');
	    countSelect();
	});


	//主题List中主题右上角按钮单击事件
	$(".js-mod-theme-ico").on('click', function(ev) {
	    $(ev.target).parent().siblings(".js-mod-theme-con").slideToggle('fast');
	}); 

	//主题List中，鼠标移开时隐藏
	$(".element-list-theme").on('mouseleave', function(ev) {
	    $(".js-mod-theme-con").hide();
	});
})