var $conn_form 	= $('#conn_db_form');

// 点击某类别的数据库后，弹出数据库表单
$('#supported_dbs_list .db').on('click', function(ev) {
	$('[name=kind]').val( $(ev.target).html() );
	
	$conn_form.show();
})


