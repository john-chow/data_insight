/**
 * 本controller是area区域的所有controller的容器,控制着整个area
 * 
 * 
 */
define([
	'region/show/controller',
	'region/design/controller',
    'region/switch/view',
    'entities/switch',
], function() {
	var SwitchController = DataInsightManager.module("SwitchRegion"
	        , function(SwitchRegion, DataInsightManager, Backbone, Marionette, $, _) {
	        	
	        	SwitchRegion.Controller = function(){
	        		var obj = {
	        				initialize: function(){
	        					var self = this;
	        					this.designControllerList = [];
	        					this.showControllerList = [];
	        					this.collection = DataInsightManager.request("switch:entities");
	        					this.switchViews = new SwitchRegion.Areas();
	        					/*
	        					 * 下面的三个监听一定要放在this.switchViews赋值后
	        					 */
	        					//监听新建工作区
	        					this.switchViews.on("switch:new", function(){
	        						window.newArea = true;//防止在编辑的时候新建工作区会从编辑的组件中获取数据
	        						this.newArea();
	        					}, this);
	        					this.switchViews.on("switch:remove", function(i){
	        						//删除前,选中隔壁的工作区
	        						if(i > 0){
	        							//this.switchArea(i - 1);
	        							$(".workbook").get(i-1).click();
	        						}else if(i == 0){
	        							//this.switchArea(i + 1);
	        							$(".workbook").get(i+1).click();
	        						}
	        						var removeDesignController = this.designControllerList[i];
	        						this.designControllerList.remove(removeDesignController);
	        						var removeShowController = this.showControllerList[i];
	        						this.showControllerList.remove(removeShowController);
	        						this.collection.remove(this.collection.at(i));
	        					}, this);
	        					//监听切换工作区,有前缀childview说明触发该事件的是孩子view
	        					this.switchViews.on("childview:area:switch", function(childView, i){
	        						this.switchArea(i);
	        					}, this);
	        					//默认新建一个工作簿
	        					this.newArea();
	        				},
	        				/**
	        				 * 新建工作簿(组件)
	        				 */
	        				newArea: function(){
	        					var self = this;
	        					var fetchDesingeController = new DataInsightManager.DesignRegion.Controller();
	        					$.when(fetchDesingeController).done(function(desingeController){
	        						desingeController.showDesingView();
	        						self.designControllerList.push(desingeController);
		        					var switchEntity = DataInsightManager.request("switch:entity");
		        					switchEntity.set("name",  desingeController.property.get("name"));
		        					
		        					
		        					var showController = new DataInsightManager.ShowRegion.Controller();
		        					showController.showShowView();
		        					
		        					self.showControllerList.push(showController);
		        					
		        					
		        					self.collection.add(switchEntity);
		        					
		        					self.switchViews.collection = self.collection;
		        					//显示工作簿
		        					DataInsightManager.switchRegion.show(self.switchViews);
	        					})
	        				},
	        				/**
	        				 * 切换工作簿
	        				 * @param index:第几个工作区
	        				 */
	        				switchArea: function(index){
	        					//获取指定工作簿
	        					var desingeController = this.designControllerList[index];
	        					var showController = this.showControllerList[index];
	        					desingeController.showDesingView();
	        					showController.showShowView();
	        				}
	        		}
	        		obj.initialize();
	        		return obj;
	        	}
	        });
	return SwitchController;
})