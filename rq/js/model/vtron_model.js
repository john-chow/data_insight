define([
	'backbone'
], function(Backbone) {
	var VtronModel = Backbone.Model.extend({
		
		method_map: {
			"update":		"create"
		},
		
		save: function (attributes, options) {
			options       = options || {};
			attributes    = attributes || {};
		 
			this.set(attributes);
		 
			options.data  = this.toJSON();
		 
			return Backbone.Model.prototype.save.call(this, attributes, options);
		},

		sync: function(method, model, options) {
			method = this.method_map[method];
			return Backbone.Model.prototype.sync.call(this, method, model, options);
		}

	});

	return VtronModel
})
