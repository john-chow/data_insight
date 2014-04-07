define([
"backbone"
, "model/vtron_model"
], function(Backbone, VtronModel) {

	/*
		数据格式:  只有一对key-value
		其中，key是本model的id ['column', 'row']
		value是属性值列表 []
	*/
	var AxesModel 	= VtronModel.extend({
		urlRoot: 		"axes/"
	});
	

	var AxesView = Backbone.View.extend({

		name:		"",				// [column, row]
		tagName:	"div",
		className:	"dragging-custom design-column clearfix",
		templateFun: _.template(
			"<div class='test'><%= label %></div>" 	+
			"<ul id='<%= name %>_sortable' ondragover='return false' class='connectedSortable clearfix'></ul>"
		),

		initialize: function(opt) {
			this.name 		= opt.name;
			this.model = new AxesModel( {id: this.name} );
			this.render();
		},

		render: function() {
			var label = ('column' === this.name) ? '列' : '行';
			this.$el.html( this.templateFun({
					'name':		this.name
					, 'label':	label
				})	
			);

			this.setDragProperty();
		},

		setDragProperty: function() {
			//设置可自动排序
			var self = this;

			this.sortObj = this.$("#" + this.name + "_sortable");
			this.sortObj.sortable({
				connectWith: ".connectedSortable",
				//revert: true,
				zIndex: "3000",
				//placeholder: "ui-state-highlight",
				cursor: "default",
				//所有的回调函数接受两个参数: 浏览器事件和ui对象
				start: function(event,ui) { //这个事件在排序开始时触发
					self.$(".dragging-custom").addClass("dragging-change-border");
					sessionStorage.dragContent=$(this).find("li").html();//把数据放在session 
				},
				sort: function(event,ui) {  //这个事件在排序时触发
				},
				change: function(event,ui) { //这个事件在排序时触发,但是仅仅在对象在DOM中的位置改变时才会触发.
				},
				beforeStop: function(event,ui) {  //这个事件在排序停止时触犯,但仅仅在placeholder/helper依然存在时触发.
				},
				stop: function(event,ui) { //这个事件在排序停止时触发.
					self.$(".dragging-custom").removeClass("dragging-change-border");
					self.afterSort(event, ui)
				},
				update: function(event,ui) { //这个事件在用户停止排序并且DOM节点位置发生改变时出发.
				},
				receive: function(event,ui) { //这个时间在一个已连接的sortable接收到来自另一个列表的元素时触发.
				},
				remove: function(event,ui) { //这个事件在sortable中的元素移除自身列表添加到另一个列表时触发.
				},
				over: function(event,ui) { //这个事件在一个元素添加到连接列表中时触发.
				},
				out: function(event,ui) { //这个事件在一个元素移除连接列表时触发.
				},
				activate: function(event,ui) { //这个事件发生在使用连接列表,每个连接列表在拖动开始准备接受它时触发.
				},
				deactivate: function(event,ui) { //这个事件发生在排序结束后,传播到所有可能的连接列表.
				}
			}).disableSelection()
		},

		afterSort: function(ev, ui) {
			// 要判断是增加属性、还是只是排序
			var draged 			= ui.item.html();
			var modelContents 	= this.model.get(this.name) || []; 			
			var backupModelList = modelContents;

			if( $.inArray(draged, modelContents) < 0 ) {
				modelContents.push(draged);
				this.model.set(this.name, modelContents)
			}

			// 这里从html页面上找寻属性顺序，原则上不合理，有待修改
			var list = this.sortObj.children();
			var tm = [];
			$.each(list, function(i, x) {
				tm.push( $(x).html() )
			})

			var self = this;
			this.model.set(this.name, tm);
			this.model.save(null, {
				"success": function(m, res, opt) {
					if(res.succ) {
						self.trigger("save_finished")
					} else {
						alert('11111');
						self.model.set(self.name, backupModelList)
					}
				}
				, "error":  function() {
					self.model.set(self.name, backupModelList)
					// TBD 	视图山按照原来的样式重新摆弄属性列表
				}
			})
		}
	});

	return AxesView
})
