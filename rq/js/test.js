define([
  'jquery'
], function($) {

	t = {
		start: function() {
			$.ajax({
				type:	'POST'
				, url:	'http://10.1.50.125:9000/subject/rm_scene/'
				, dataType: 'json'
				, data:	{
					'sub_id':		79
					, 'scn_id':		127
					, 'order':		1
				}
				, success: function() {
				}
				, error: function() {
					alert("yyyyy")
				}
			})
		}
	};

	return t;
})
