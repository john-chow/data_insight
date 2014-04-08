define([
	'backbone'
	, 'model/vtron_model'
], function(Backbone, VtronModel) {
	var FilterModel = VtronModel.extend({
		urlRoot:	"/indb/filter/",
	});

	return FilterModel
})
