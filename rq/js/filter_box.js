define([
"backbone"
, "base_sheet"
, "bootstrap"
, "model/vtron_collection"
, 'model/filter_box'
, "color"
, "jquery"
, "jqueryUi"
, "text!../template/filter_box.html"
], function(Backbone, BaseSheetView, b, VtronCollection, FilterModel, 
			color, jquery, jqueryUi, filterBoxHtml) {

	var FiltersCollection = VtronCollection.extend({
		model: FilterModel
	});


    var FilterBoxView = BaseSheetView.extend({

        tagName:    "div",
        id:         "filter_box",
        template:   filterBoxHtml,
		item_template:	"<li class='filter-li'></li>",

		events: {
			"click .filter-remove"           		:"rmAttr",
			"click .filter-show-old"         		:"showFilterOld",
			"click .filter_tag_color .close"      	:"removeColor",
			"click .filter_tag_size .close"       	:"removeSize",
			"click .filter_tag_shape .close"       	:"removeShape",
		},

        initialize: function() {
			_.bindAll(this, "chooseFilter", "choosePage", "chooseColor"
							, "chooseSize", "chooseShape");

			this.collection = new FiltersCollection();
			//删除事件
			var self = this;
			this.on("collection:delete", function(title) {
				rmmodel = _.find(self.collection.models, function(model){
				 	return model.get("property")==title; 
				});
				self.collection.remove(rmmodel);
				self.collection.myPass("area:user_set_action")
			});
            this.render();
            this.$("#filter_conditions").on( "drop", this.chooseFilter );
            this.$("#filter_page").on( "drop", this.choosePage);
            this.$("#filter_tag_color").on( "drop", this.chooseColor);
            this.$("#filter_tag_size").on( "drop", this.chooseSize);
            this.$("#filter_tag_shape").on( "drop", this.chooseShape);
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
			});
			// 大小控制条
			this.$( "#master" ).slider({
			      value: 50,
			      orientation: "horizontal",
			      range: "min",
			      animate: true
			});
		},

		chooseFilter: function(ev) {
			var data = $.extend( 
				JSON.parse(sessionStorage.dragment)
				, {"sheetId": this.sheetId} 
			);

			VtronEvents.trigger("modal:show_filter", data)
		},

		/*showMenuB: function(ev){
			$(ev.target).find("b").show();
		},

		hideMenuB:function(ev){
			$(ev.target).find("b").hide();
		},*/


		rmAttr: function(ev) {
			var title = $(ev.target).parents(".filter-li").children("span").html();
			$(ev.target).parents(".filter-li").remove();
			//1.把新的筛选器发送到服务器，更新数据
			this.trigger("collection:delete", title)
			//2.删除对应的模态框或者把对应的模态框的内容清除
		},

		showFilterOld: function(ev) {
			var title = $(ev.target).parents(".filter-li").children("span").html();
			$("#filter_modal[data="+title+"]").modal("show");
		},

		chooseColor: function(ev, ui) {
			$(".filter_tag_color").remove();
			var type=$(ui.draggable).attr("type");
			var title =$(ui.draggable).find(".attr").html();
			var button ="<b class='close'>×</b>";
			var insert = "<li class='filter_tag_color' type='"+type+"'>颜色：<span data='color'>"+title+"</span>"+button+"</li>";
			$("#filter_tag_choosed").append(insert);
			this.triggerOut(
			//Backbone.Events.trigger(
				"area:user_set_action"
				, {"color":title}
			)
		},

		chooseSize: function(ev, ui) {
			$(".filter_tag_size").remove();
			var type=$(ui.draggable).attr("type");
			var title =$(ui.draggable).find(".attr").html();
			var button ="<b class='close'>×</b>";
			var insert = "<li class='filter_tag_size' type='"+type+"'>大小：<span data='size'>"+title+"</span>"+button+"</li>";
			$("#filter_tag_choosed").append(insert);
			this.triggerOut(
			//Backbone.Events.trigger(
				"area:user_set_action"
				, {"size":title}
			)
		},

		chooseShape: function(ev, ui) {
			$(".filter_tag_shape").remove();
			var type=$(ui.draggable).attr("type");
			var title =$(ui.draggable).find(".attr").html();
			var button ="<b class='close'>×</b>";
			var insert = "<li class='filter_tag_shape' type='"+type+"'>形状：<span data='size'>"+title+"</span>"+button+"</li>";
			$("#filter_tag_choosed").append(insert);
			this.triggerOut(
			//Backbone.Events.trigger(
				"area:user_set_action"
				, {"shape":title}
			)
		},

		choosePage: function(ev) {
			//测试
			$(ev.target).find("#filter_body").html("插入页面");
		},

		removeColor: function(ev) {
			$(".filter_tag_color").remove();
			this.triggerOut("area:user_unset_action", "color")
			//Backbone.Events.trigger("area:user_unset_action", "color")
		},

		removeSize: function(ev) {
			$(".filter_tag_size").remove();	
			this.triggerOut("area:user_unset_action", "size")
			//Backbone.Events.trigger("area:user_unset_action", "size")
		},

		removeShape: function(ev) {
			$(".filter_tag_shape").remove();	
			this.triggerOut("area:user_unset_action", "shape")
			//Backbone.Events.trigger("area:user_unset_action", "shape")
		},


		/*            
		    中某过滤条件后，点击"确定",触发过滤框的collection增加model;
			监听collection的add事件，触发后，把新增的model提交服务器
			监听model提交的success事件，触发后，把新增的内容显示出来
		*/

		afterModelAdded: function(model) {
			this.addFilterItem(model);
			this.collection.myPass("area:user_set_action")
		},

		addFilterItem: function(model) {
			//判断判断条件之前是否存在
			$("#filter_body>ul>li span").each(function(ev){
			   if($(this).html()==model.toJSON()["property"])
			   		$(this).parent().remove();
			 });
			this.$("#filter_body>ul").append(
				$(this.item_template).html("<span>"
					+ model.toJSON()["property"] +
					"</span><b data-toggle='dropdown' class='glyphicon glyphicon-plus-sign dropdown-toggle'></b>"
					+"<ul class='dropdown-menu'>"
					+"<li class='filter-show-old'><a href='#''>筛选</a></li>"
					+"<li class='filter-remove'><a href='#''>移除</a></li>"
					+"</ul>")
				);

			/*this.$("#filter_body ul li").on( "click", function(){
				title=$(this).find("span").html();
				$("#filter_modal[data="+title+"]").modal("show");
			});*/
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
			this.$('#filter_conditions, #filter_page, #filter_tag_color, #filter_tag_size, #filter_tag_shape').droppable({
				drop: function(event, ui) {
				}
			});
		}
    });

    return FilterBoxView;
});
