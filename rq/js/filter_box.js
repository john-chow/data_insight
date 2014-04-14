define([
"backbone"
, "bootstrap"
, "model/filter_boxes"
, "color"
, "jquery"
, "text!../template/filter_box.html"
], function(Backbone, b, FiltersCollection, color, jquery, filterBoxHtml) {

    var FilterBoxView = Backbone.View.extend({

        tagName:    "div",
        id:         "filter_box",
        template:   filterBoxHtml,
		item_template:	"<li></li>",

        initialize: function() {
			this.collection = new FiltersCollection();
            this.render();
        },

        render: function() {
            this.$el.html(filterBoxHtml);
			this.setDragProperty();
			 // 颜色板
			this.$('.colorBoard').each( function() {
		        $(this).minicolors({
		          control: $(this).attr('data-control') || 'hue',
		          defaultValue: $(this).attr('data-defaultValue') || '',
		          inline: $(this).attr('data-inline') === 'true',
		          letterCase: $(this).attr('data-letterCase') || 'lowercase',
		          opacity: $(this).attr('data-opacity'),
		          position: $(this).attr('data-position') || 'bottom left',
		          change: function(hex, opacity) {
		            if( !hex ) return;
		            if( opacity ) hex += ', ' + opacity;
		            try {
		            } catch(e) {}
		          },
		          theme: 'bootstrap'
		        });
			})
		},


		/*            
		    中某过滤条件后，点击"确定",触发过滤框的collection增加model;
			监听collection的add事件，触发后，把新增的model提交服务器
			监听model提交的success事件，触发后，把新增的内容显示出来
		*/

		afterModelAdded: function(model) {
			this.addFilterItem(model);
			this.collection.myPass("area:user_action")
		},

		addFilterItem: function(model) {
			//判断判断条件之前是否存在
			$("#filter_body ul li").each(function(ev){
			   if($(this).html()==model.toJSON()["property"])
			   		$(this).remove();
			 });
			this.$("#filter_body ul").append(
				$(this.item_template)
						.html( model.toJSON()["property"] )
			);
			this.$("#filter_body ul li").on( "click", this.showModal);
		},

		showModal: function() {
			$("#filter_modal").modal("show");
		},

		/*
		afterModelAdded: function(model) {
			// 更新到服务器
			var self = this;
			model.save(null, {
				success: function(m, res, opt) {
					if(res.succ) {
						self.$("#filter_body").append('<label>xxx</label>');
						Backbone.Events.trigger("draw:ready", res.data)
					} else {
					}
				},
				error: function(m, res, opt) {
					self.collection.remove(m, {'silent': true})
					// 发出错误警告消息
				}
			});
		},
		*/

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
