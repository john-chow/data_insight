define([
        'entities/graph',
        'entities/filter',
        'entities/axis',
        'entities/property',
        'region/design/view'
],function(){
	var designController = DataInsightManager.module("DesignRegion", function(DesignRegion, DataInsightManager,
			Backbone, Marionette, $, _){
		
		DesignRegion.Controller = function(){
			var defer = $.Deferred();
			
			var obj = {
				/*
				 * 初始化controller
				 */
				initialize: function(){
					var self = this;
					var fetchGraph = DataInsightManager.request("graph:entity");
					var fetchFilter = DataInsightManager.request("filter:entity");
					var fetchProperty = DataInsightManager.request("property:entity");
					///////////////////graph///////////////////////
					$.when(fetchGraph).done(function(graph){
						self.graph = graph;
						self.graphView = new DesignRegion.Graph({
							model: graph
						});
						//监听编辑x轴元素的事件
						self.graphView.on("x:edit", function(xItem){
							var axisX = DataInsightManager.request("axis:entity");
							axisX.set(xItem);
							var dialogXView = new DesignRegion.DialogX({
								model: axisX
							});
							DataInsightManager.dialogRegion.show(dialogXView);
						})
						
						//监听编辑y轴元素的事件
						self.graphView.on("y:edit", function(yItem){
							var axisY = DataInsightManager.request("axis:entity");
							axisY.set(yItem);
							var dialogYView = new DesignRegion.DialogY({
								model: axisY
							});
							DataInsightManager.dialogRegion.show(dialogYView);
						})
						
						//////////////////////filter///////////////////////
						$.when(fetchFilter).done(function(filter){
							self.filter = filter;
							self.filterView = new DesignRegion.Filter({
								model : filter
							});
							//监听重绘,比如切换过滤器的时候就要重绘
							self.filter.on("filter:rerender", function(){
								this.filterView.render();
							}, self);
							/////////////////////property////////////////////////
							$.when(fetchProperty).done(function(property){
								self.property = property;
								self.propertyView = new DesignRegion.Property({
									model: property
								})
								defer.resolve(self);
							})
							
						})
					})
					//this.showDesingView();
				},
				/*
				 * 显示整个design视图，design视图是个layoutview
				 * 同时打开监听视图变化事件以及打开默认视图
				 */
				showDesingView: function(){
					//显示整个design视图
					var designView = new DesignRegion.Design();
					DataInsightManager.designRegion.show(designView, {preventDestroy: true});
					this.designView = designView;
					//显示默认视图，即图表视图
					this.showDefaultView();
					//监听显示区域视图变化的事件，实时显示指定视图，即响应design区域上的选显卡
					this.listenChangeView();
				},//end showDesingView function
				/*
				 * 监听显示design区域的显示view，根据design区域的选项卡显示其内容
				 */
				listenChangeView: function(){
					this.designView.on("show:design:content", function(whichView){
						if(!whichView || whichView == "graph"){//显示图表视图
							$("#design-filter,#design-property").hide();
							if(!this.designView.designGraphRegion){
								this.designView.designGraphRegion.show(this.graphView);
								this.designView.designGraphRegion.showed = true;
							}
							
							$("#design-graph").show();
						}else if(whichView == "filter"){//显示过滤器视图
							$("#design-graph,#design-property").hide();
							if(!this.designView.designFilterRegion.showed){
								this.designView.designFilterRegion.show(this.filterView);
								this.designView.designFilterRegion.showed = true;
							}
								
							$("#design-filter").show();
						}else{//显示属性视图
							$("#design-graph,#design-filter").hide();
							if(!this.designView.designPropertyRegion.showed){
								this.designView.designPropertyRegion.show(this.propertyView);
								this.designView.designPropertyRegion.showed = true;
							}
							$("#design-property").show();
						}
					}, this);
				},//end listenChangeView function
				/*
				 * 显示默认的design区域的视图，即显示图标视图
				 */
				showDefaultView: function(){
					$("#design-graph").show();
					this.designView.designGraphRegion.show(this.graphView, {preventDestroy: true});
				},
				
			}
			obj.initialize();
			return defer.promise();
		}
	});
	
	return designController;
})
