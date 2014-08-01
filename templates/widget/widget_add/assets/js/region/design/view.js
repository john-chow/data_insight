define([
"text!region/design/template/region_design.html", 
"text!region/design/template/view_graph.html", 
"text!region/design/template/view_filter.html", 
"text!region/design/template/view_property.html", 
"text!region/design/template/dialog_edit_x.html",
"text!region/design/template/dialog_edit_y.html"
], function(regionDesignTemplate, graphViewTemplate, filterViewTemplate, propertyViewTemplate,
				dialogEditXTemplate, dialogEditYTemplete){
	var DesignRegionView = DataInsightManager.module("DesignRegion",
		    function(DesignRegion, DataInsightManager, Backbone, Marionette, $, _){
		
		//过滤器视图
		DesignRegion.Filter = Marionette.ItemView.extend({
			template: filterViewTemplate
		})
		
		
		//属性视图
		DesignRegion.Property = Marionette.ItemView.extend({
			template: propertyViewTemplate,
			onShow: function(){
				//显示值
				$("[name=style]").val(this.model.get("style"));
				$("[name=autoRefresh]").val(this.model.get("autoRefresh"));
				$("[name=isPublish]").val(this.model.get("isPublish"));
			}
		})
		
		
		//图表视图
		DesignRegion.Graph = Marionette.ItemView.extend({
			template: graphViewTemplate,
			//调用完layoutview的show或者region的show方法后，触发
			initialize: function(){
				//当改变图表类型的时候触发，更新图表视图
				this.model.on("feature:change", function(mapping){
					this.render();//重新render后等于新建视图，则在onShow方法绑定的事件失效
				}, this);
			},
			onShow: function(){
				var self = this;
				$(".select-graph .charts").each(function(){
					var type = $(this).data("graph");
					$(".select-graph").on("click", ".chart-" + type , function(){
						//触发改变图表类型事件,更新操作由图表model完成
						self.model.trigger("graphType:change", type);
					});
				});
				this.setDragProperty();
				//监听x轴y轴的操作
				$("#x_sortable").on("click", ".coordinate-remove a", function(e){
					var xItem = $(e.target).data("xitem");
					self.model.trigger("x:remove", xItem);
					$(e.target).parents(".measure").remove();
				});
				$("#y_sortable").on("click", ".coordinate-remove a", function(e){
					var yItem = $(e.target).data("yitem");
					self.model.trigger("y:remove", yItem);
					$(e.target).parents(".mension").remove();
				});
				//监听编辑x轴y轴中元素编辑的操作
				$("#x_sortable").on("click", ".coordinate-edit a", function(e){
					var xItem = $(e.target).data("xitem");
					self.trigger("x:edit", xItem);
				});
				$("#y_sortable").on("click", ".coordinate-edit a", function(e){
					var yItem = $(e.target).data("yitem");
					self.trigger("y:edit", yItem);
				});
			},
			//调用该view的render方法触发
			onRender: function(){
				this.onShow();
			},
			/*
			 * 设置x轴，y轴的排序拖拽
			 */
			setDragProperty: function(e){
				$("#x_sortable,#y_sortable").sortable({
					connectWith: ".connectedSortable",
					//revert: true,
					zIndex: "3000",
					//placeholder: "ui-state-highlight",
					cursor: "default",
					//所有的回调函数接受两个参数: 浏览器事件和ui对象
					start: function(event,ui) { //这个事件在排序开始时触发
						
					},
					sort: function(event,ui) {  //这个事件在排序时触发
					},
					change: function(event,ui) { //这个事件在排序时触发,但是仅仅在对象在DOM中的位置改变时才会触发.
					},
					beforeStop: function(event,ui) {  //这个事件在排序停止时触犯,但仅仅在placeholder/helper依然存在时触发.
					},
					stop: function(event,ui) { //这个事件在排序停止时触发.
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
				}).disableSelection();
			}
		})
		
		//整个Design区域的视图
		DesignRegion.Design = Marionette.LayoutView.extend({
			template: regionDesignTemplate,
			className: "outer-design-content",
			events: {
				"click .graph-view" : "switchGraphTab",
				"click .filter-view" : "switchFilterTab",
				"click .property-view" : "switchPropertyTab"
			},
			regions: {
				designGraphRegion: "#design-graph",
				designFilterRegion: "#design-filter",
				designPropertyRegion: "#design-property"
				
			},
			switchGraphTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "graph");
			},
			switchFilterTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "filter");
			},
			switchPropertyTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "property");
			},
			
		});
		
		
		//编辑x轴对应的模态框view
		DesignRegion.DialogX = Marionette.ItemView.extend({
			className: "modal-dialog",
			template: dialogEditXTemplate,
		});
		
		//编辑y轴对应的模态框view
		DesignRegion.DialogT = Marionette.ItemView.extend({
			className: "modal-dialog",
			template: dialogEditYTemplete,
		})
	})
	return DesignRegionView;
})