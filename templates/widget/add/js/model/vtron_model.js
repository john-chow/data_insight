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
            // 空内容就不必传送
			var jsonModel 		= this.toJSON();
            if(undefined === jsonModel) {
                alert("xxxxxxx");
                return
            }

			options       = options || {};
			attributes    = attributes || {};

			this.set(attributes);

			// 过滤所有value为null之类的项
			var cleanJsonModel 	= {};
			for (var key in jsonModel) {
				var value = jsonModel[key];
				if (value !== null) {
					cleanJsonModel[key] = value
				}
			};

			var strJsonModel 	= JSON.stringify(cleanJsonModel);
			options.data 		= {'data':	strJsonModel };


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
		 	// Backbone.emulateJSON = true即将ajax提交的数据为object类型的数据转为字符串
            Backbone.emulateJSON = true;
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

		myPass: function() {
			Backbone.Events.trigger( "area:user_set_action", this.toJSON() )
			//Backbone.Events.trigger( "area:user_set_action", this.toJSON() )
		}

	});

	return VtronModel
})
