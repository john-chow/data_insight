define([
	'backbone'
], function(Backbone, FilterModel) {
	var VtronCollection = Backbone.Collection.extend({

        /*
		// 对外传递事件
		triggerOut: function(ev, data) {
		  	VtronEvents.trigger(this.sheetId + ev, data)
		},

		// 从外监听事件
		onOut: function(ev, callback) {
		  	VtronEvents.on(this.sheetId + ev, callback)
		},
        */

		// 丰富用户的success回调
		fetch:	function(options) {
			var success = options.success;
			var backupThis = this.models;
			options.success = function(collection, resp, options) {
				// 因为backbone源代码里面已经直接用resp给collection赋值了
				// 这里就是撤回上述操作
				collection.reset(backupThis, {"silent": true});
				if(resp.succ) {
					resp = resp.data;
					var method = options.reset ? 'reset' : 'set';
					collection[method](resp, options);
				
					// 调用在使用fetch时，填的success回调函数
					success(collection, resp, options)
				} else {
					alert(resp.msg)
				}
			}
		},

		/* 取出全部model的json内容，做序列化 */
		myPass: function() {
			//Backbone.Events.trigger(
			Backbone.Events.trigger(
				"area:user_set_action"
				, {"filter": JSON.stringify(this)}
			)
		}
	});

	return VtronCollection
})
