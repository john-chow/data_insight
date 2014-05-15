define([
	"backbone"
], function(Backbone) {

	VtronEvents = {
		triggerOut:			function(ev, data) {
			if ("sheetId" in this) {
				Backbone.Events.trigger(this.sheetId + ev, data)
			}
			else {
				Backbone.Events.trigger(ev, data)
			}
		},

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
