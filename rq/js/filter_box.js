define([
"backbone"
, "bootstrap"
, "model/filter_boxes"
, "text!../template/filter_box.html"
], function(Backbone, b, FiltersCollection, filterBoxHtml) {

    var FilterBoxView = Backbone.View.extend({

        tagName:    "div",
        id:         "filter_box",
        template:   filterBoxHtml,

        initialize: function() {
			this.collection = new FiltersCollection();
            this.render();
        },

        render: function() {
            this.$el.html(filterBoxHtml);
			this.setDragProperty()
        },

		/* 
			增加过滤条件的机制：
			选中某过滤条件后，点击"确定",触发过滤框的collection增加model;
			监听collection的add事件，触发后，把新增的model提交服务器
			监听model提交的success事件，触发后，把新增的内容显示出来
		*/
		afterModelAdded: function(model) {
			// 更新到服务器
			var self = this;
			model.save(null, {
				success: function(m, res, opt) {
					self.$("#filter_body").append('<label>xxx</label>')
				},
				error: function(m, res, opt) {
					self.collection.remove(m, {'silent': true})
					// 发出错误警告消息
				}
			});
		},

		setDragProperty: function() {
			//此代码删除了，触发不了drop，原因暂不明确
			this.$('#filter_conditions').droppable({
				drop: function(event, ui) {
				}
			});
		}
    });

    return FilterBoxView;
});
