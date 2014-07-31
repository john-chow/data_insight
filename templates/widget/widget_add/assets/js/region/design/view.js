define([
"text!region/design/template/region_design.html", 
"text!region/design/template/view_graph.html", 
"text!region/design/template/view_filter.html", 
"text!region/design/template/view_property.html", 
], function(regionDesignTemplate, graphViewTemplate, filterViewTemplate, propertyViewTemplate){
	var DesignRegionView = DataInsightManager.module("DesignRegion",
		    function(DesignRegion, DataInsightManager, Backbone, Marionette, $, _){
		
		//过滤器视图
		DesignRegion.Filter = Marionette.ItemView.extend({
			template: filterViewTemplate
		})
		//属性视图
		DesignRegion.Property = Marionette.ItemView.extend({
			template: propertyViewTemplate
		})
		//图表视图
		DesignRegion.Graph = Marionette.ItemView.extend({
			template: graphViewTemplate,
			//调用完layoutview的show或者region的show方法后，触发
			onShow: function(){
				var self = this;
				$(".select-graph .charts").each(function(){
					var type = $(this).data("graph");
					$(".select-graph").on("click", ".chart-" + type , function(){
						//触发改变图表类型事件,更新操作由图表model完成
						self.model.trigger("change:graphType", type);
					});
				})
			},
			//调用该view的render方法触发
			onRender: function(){
				var self = this;
				$(".select-graph .charts").each(function(){
					var type = $(this).data("graph");
					$(".select-graph").on("click", ".chart-" + type , function(){
						//触发改变图表类型事件,更新操作由图表model完成
						self.model.trigger("change:graphType", type);
					});
				})
			},
			initialize: function(){
				//当改变图表类型的时候触发，更新图表视图
				this.model.on("change:feature", function(mapping){
					this.render();//重新render后等于新建视图，则在onShow方法绑定的事件失效
				}, this)
			},
			changeGraph: function(e){
				
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
				designContentRegion: "#design-content"
			},
			switchGraphTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
				
			},
			switchFilterTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
			},
			switchPropertyTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
			},
			
		})
	})
	return DesignRegionView;
})