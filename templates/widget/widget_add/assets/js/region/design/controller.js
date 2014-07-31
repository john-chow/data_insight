define([
        'entities/graph',
        'entities/filter',
        'entities/property',
        'region/design/view'
],function(){
	var designController = DataInsightManager.module("DesignRegion", function(DesignRegion, DataInsightManager,
			Backbone, Marionette, $, _){
		DesignRegion.Controller = {
				showGraph: function(){
					var fetchGraph = DataInsightManager.request("graph:entity");
					//显示整个design视图
					var designView = new DesignRegion.Design();
					DataInsightManager.designRegion.show(designView);
					//默认选中图表选项卡
					var graphView = new DesignRegion.Graph({
						model: fetchGraph
					});
					designView.designContentRegion.show(graphView);
				},
				showFilter: function(){
					var fetchFilter = DataInsightManager.request("filter:entity");
				}
		}
	});
	
	return designController;
})