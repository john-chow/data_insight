define([
"backbone"
, "bootstrap"
, "draw_panel"
, "axes"
], function(Backbone, b, DrawPanelView, AxesView) {

    var DrawWorkspaceView = Backbone.View.extend({
        
        tagName:    "div",
        id:         "draw_workplace",

        events: {
            "dblclick"                                           : "open",
            "click .icon.doc"                                    : "select",
            "mouseenter #column_sortable li,#row_sortable li"    : "showClose",
            "mouseleave #column_sortable li,#row_sortable li"    : "hideClose",
            "click .plots_close"                                 : "deleteLi",
            "mouseout .plots_close"                              : "hideCloseByOut"
          },

        initialize: function() {
			this.xAxesView 		= new AxesView( {'name': 'column'} );
			this.yAxesView 		= new AxesView( {'name': 'row'} );
			this.drawPanelView	= new DrawPanelView();

            this.render();
			this.setDragProperty()
        },

        render: function() {
			this.$el.append( $('<div id=draw_plots></div>').append(
				this.xAxesView.el
				, this.yAxesView.el
			), this.drawPanelView.el );
        },

        showClose: function(ev) {
            $(ev.target).append("<button type='button' class='plots_close'>&times;</button>");
        },

        hideClose: function(ev) {
            $(ev.target).find("button").remove();
        },

        hideCloseByOut: function(ev) {
            $(ev.target).remove();
        },

        deleteLi: function(ev) {
            $(ev.target).parent().remove();
        },

		setDragProperty: function() {
			//设置可自动排序
			var self = this;
			this.$( "#column_sortable,#row_sortable" ).sortable({
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
			}).disableSelection();;
		}

    });

    return DrawWorkspaceView;
})
