define([
	'jquery'
	, 'backbone'
	, 'model/filter_box'
], function($, Backbone, FilterModel) {
	var FiltersCollection = Backbone.Collection.extend({
		url: "",

		model: FilterModel,
	});

	return FiltersCollection
})
