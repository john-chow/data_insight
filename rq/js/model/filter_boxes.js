define([
	'backbone'
	, 'model/filter_box'
], function(Backbone, FilterModel) {
	var FiltersCollection = Backbone.Collection.extend({
		url: "",

		model: FilterModel,

		/* 取出全部model的json内容，做序列化 */
		myPass: function() {
			Backbone.Events.trigger(
				"area:user_action"
				, {"filter": JSON.stringify(this)}
			)
		}
	});

	return FiltersCollection
})
