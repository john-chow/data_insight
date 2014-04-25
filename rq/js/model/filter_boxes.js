define([
	'backbone'
	, 'model/filter_box'
	, "vtron_events" 
], function(Backbone, FilterModel, VtronEvents) {
	var FiltersCollection = Backbone.Collection.extend({
		url: "",

		model: FilterModel,

		// 对外传递事件
		triggerOut: function(ev, data) {
		  	VtronEvents.trigger(this.sheetId + ev, data)
		},

		// 从外监听事件
		onOut: function(ev, callback) {
		  	VtronEvents.on(this.sheetId + ev, callback)
		}

		/* 取出全部model的json内容，做序列化 */
		myPass: function() {
			//Backbone.Events.trigger(
			this.triggerOut(
				"area:user_set_action"
				, {"filter": JSON.stringify(this)}
			)
		}
	});

	return FiltersCollection
})
