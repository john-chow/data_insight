define([
	'backbone'
	, "vtron_events" 
], function(Backbone, VtronEvents) {
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

			var jsonModel 		= this.toJSON();
			var strJsonModel 	= JSON.stringify(jsonModel);
			options.data = {'data':	strJsonModel };


			/*
			$.each(jsonModel, function(k, v) {
				if (v instanceof Array) {
					jsonModel[k] = JSON.stringify(v)
				}
			});
		 
			options.data = jsonModel;
			//options.data  = this.toJSON();
			*/
		 
			return Backbone.Model.prototype.save.call(this, attributes, options);
		},

		sync: function(method, model, options) {
			method = this.method_map[method];
			return Backbone.Model.prototype.sync.call(this, method, model, options);
		},

		// 在model.save时，所有从服务器返回的数据都会被默认放进model里面
		// 加上1个开关，可以选择阻止上述默认行为
		parse: function(resp, options) {
			if ( options["no_feeding"] ) {
				return {}
			}

			return Backbone.Model.prototype.parse.call(this, resp, options);
		},

		// 对外传递事件
		triggerOut: function(ev, data) {
		  	VtronEvents.trigger(this.sheetId + ev, data)
		},

		 // 从外监听事件
		onOut: function(ev, callback) {
		  	VtronEvents.on(this.sheetId + ev, callback)
		}

		myPass: function() {
			this.triggerOut( "area:user_set_action", this.toJSON() )
			//Backbone.Events.trigger( "area:user_set_action", this.toJSON() )
		}

	});

	return VtronModel
})
