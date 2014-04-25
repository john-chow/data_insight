define([
	"backbone"
], function(Backbone) {

	var BaseSheetView = Backbone.View.extend({

		getSheetId:	function() {
			return this.sheetId
		}
	});

	BaseSheetView.prototype.sheetId = 1;

	return BaseSheetView
})	
