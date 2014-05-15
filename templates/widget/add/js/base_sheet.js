define([
	"backbone"
	, "vtron_events" 
], function(Backbone, VtronEvents) {

	var BaseSheetView = Backbone.View.extend({

		  // 对外传递事件
		  triggerOut: function(ev, data) {
		  	  VtronEvents.trigger(this.sheetId + ev, data)
		  },

		  // 从外监听事件
		  onOut: function(ev, callback) {
		  	  VtronEvents.on(this.sheetId + ev, callback)
		  }
	});

	BaseSheetView.prototype.sheetId = 1;

	return BaseSheetView
})	
