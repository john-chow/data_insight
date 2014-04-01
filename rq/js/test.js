define([
  'jquery'
  , 'lib/d3.v3.min'
  , 'lib/vega'
], function($, _d, _v) {

	t = {
		start: function() {
			$.ajax({
				type:	'post'
				, url:	'http://10.1.50.125:9000/indb/'
				//, dataType: 'json'
				, data:	{
					ip:	"10.1.50.125"
					, port: 5432
					, db: 'mytableau'
					, user: 'postgres'
					, pwd: 	'123456'
					, table: 'test'
				}
				, success: function() {
					xxx()
				}
				, error: function() {
					alert("yyyyy")
				}
			})
		}
	};

	function xxx() {
		$.ajax({
			type:	'post'
			, url:	'http://10.1.50.125:9000/indb/select/'
			, dataType: 'json'
			, data:	{
				'x':	JSON.stringify(['price'])
			}
			, success: function(json) {
				showPic(json);
				alert('xxxx');
				sendFilter()
			}
			, error: function() {
				//alert("yyyyy")
			}
		})
	}

	function yyy() {
		$.ajax({
			type:	'post'
			, url:	'http://10.1.50.125:9000/indb/select/'
			, dataType: 'json'
			, data:	{
				'x':	JSON.stringify(['sale'])
			}
			, success: function(json) {
				showPic(json);
				alert('yyy');
				xxx()
				//sendFilter()
			}
			, error: function() {
				//alert("yyyyy")
			}
		})
	}

	function sendFilter() {
		$.ajax({
			type:	'post'
			, url:	'http://10.1.50.125:9000/indb/filter/add/'
			, dataType: 'json'
			, data:	{
				'f':	JSON.stringify([
						{'id': '11111'
						,'property': 'price'
						,'val_list': [70]
						}
				])
			}
			, success: function(json) {
				showPic(json)
			}
			, error: function() {
				//alert("yyyyy")
			}
		})
	}

	function showPic(json) {
		if(json.succ) {
			vg.parse.spec(json.data, function(chart) {
				d3.select("#draw_panel").selectAll("*").remove();
				var view = chart({
					el: "#draw_panel"
					, data: undefined
					, renderer: 'canvas'
				});
				view.update();
			});
		}
		else {
			alert("error")
		}
	}

	return t;
})
