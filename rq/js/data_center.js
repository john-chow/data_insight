define([
	'backbone'
	, 'base_sheet'
	, 'model/vtron_model'
	, 'vtron_events'
], function(Backbone, BaseSheetView, VtronModel, VtronEvents) {

	var PicModel 	= VtronModel.extend({
		x:			[],
		y:			[],
		color:		"",
		size:		"",
		shape:		"",

		urlRoot: "/main/draw/",

		distribute:		function() {
		},

		initialize: 	function(sheetId) {
			this.sheetId
		},

		setToSev: function(data) {
			this.set(data);

			this.save(null, {
				success: function(m, resp, opt) {
					if (resp.succ) {
						VtronEvents.triggerOut("panel:draw_data", resp.data)
					} else {
						easy_dialog_error(resp.msg)						
						// 通知清空
						VtronEvents.triggerOut("panel:draw_data", {})
					}
				}, error: function() {
				},
				no_feeding: true
			})
		},
	});

	var WordModel	= VtronModel.extend({
		stack:		"",
		fill:		"",
		name:		"",

		distribute:		function() {
		}
	});

	
	// 数据中心，分两个部分
	// 其一是图像数据部分，影响图像成像的数据，如 x/shape等等
	// 其二是图像呈现部分，不影响图像本身，只影响图像标注等，如name等等
	// 这里其实根本不是view，只是为了获取View中的属性
	var DataCenter = BaseSheetView.extend({
		initialize: 		function() {
			this.picModel 	= new PicModel();
			this.wordModel 	= new WordModel();
			this.run()
		},

		restore: 			function() {
			this.picModel.fetch();
			this.wordModel.fetch();
		},

		run: 				function() {
			this.onOut(
				"area:user_set_action"
				, _.bind(this.picModel.setToSev, this.picModel)
		  	);
			VtronEvents.onOut("", this.wordModel.save);
		}

	});

	return DataCenter
})





