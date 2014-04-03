define([
	'jquery'
	, 'backbone'
	, 'model/vtron_model'
], function($, Backbone, VtronModel) {
	var FilterModel = VtronModel.extend({
		urlRoot:	"/indb/filter/add/",
		
		/*
		save: function (attributes, options) {
			options       = options || {};
			attributes    = attributes || {};
			a = {}
		 
			this.set(attributes);

		 
			options.data  = this.toJSON();
		 
			return Backbone.Model.prototype.save.call(this, attributes, options);
		},

		sync: function(method, model, options) {
			if("update" == method) {
				method = "create"
			}
			return Backbone.Model.prototype.sync.call(this, method, model, options);
		}
		*/

	});

	return FilterModel
})
