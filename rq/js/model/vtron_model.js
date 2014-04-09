define([
	'backbone'
], function(Backbone) {
	var VtronModel = Backbone.Model.extend({
		
		method_map: {
			"update":		"create"
			, "create":		"create"
		},
		
		/* 
			1、通过修改option值，避免backbone的model自动为元素序列化操作
			2、对于array属性的元素，自动进行序列化
		*/
		save: function (attributes, options) {
			options       = options || {};
			attributes    = attributes || {};
		 
			this.set(attributes);

			var jsonModel = this.toJSON();
			$.each(jsonModel, function(k, v) {
				if (v instanceof Array) {
					jsonModel[k] = JSON.stringify(v)
				}
			});
		 
			options.data = jsonModel;
			//options.data  = this.toJSON();
		 
			return Backbone.Model.prototype.save.call(this, attributes, options);
		},

		sync: function(method, model, options) {
			method = this.method_map[method];
			return Backbone.Model.prototype.sync.call(this, method, model, options);
		}

	});

	return VtronModel
})
