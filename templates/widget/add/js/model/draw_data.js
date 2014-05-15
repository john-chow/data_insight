define([
	'backbone'
	, 'model/vtron_model'
], function(Backbone, VtronModel) {
	var DrawDataModel = VtronModel.extend({
		urlRoot:	"/indb/draw/",
	});

	return DrawDataModel
})
