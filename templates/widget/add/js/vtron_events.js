define([
	"backbone"
], function(Backbone) {

	VtronEvents = {
		//触发事件ev,data触发的事件的回调函数的参数
		triggerOut:			function(ev, data) {
			if ("sheetId" in this) {
				//lert(this.sheetId + ev)
				Backbone.Events.trigger(this.sheetId + ev, data)
			}
			else {
				//alert(ev)
				Backbone.Events.trigger(ev, data)
			}
		},
		//监听事件ev，当调用triggerOut的时候触发ev则调用callback，
		//trggerOut的data会传入到callback的参数中
		onOut:				function(ev, callback) {
			if ("sheetId" in this) {
				Backbone.Events.on(this.sheetId + ev, callback)
			}
			else {
				Backbone.Events.on(ev, callback)
			}
		}
	};

	_.extend(Backbone.View.prototype, VtronEvents);
	_.extend(Backbone.Model.prototype, VtronEvents);

	return VtronEvents	
})
