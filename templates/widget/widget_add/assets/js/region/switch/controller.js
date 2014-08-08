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
	        					this.newArea();
	        				},
	        				/**
	        				 * 新建工作簿(组件)
	        				 */
	        				newArea: function(){
	        					var desingeController = new DataInsightManager.DesignRegion.Controller();
	        					var showController = new DataInsightManager.ShowRegion.Controller();
	        					desingeController.showDesingView();
	        					showController.showShowView();
	        					this.designControllerList.push(desingeController);
	        					this.showControllerList.push(showController);
	        					var switchEntity = DataInsightManager.request("switch:entity");
	        					switchEntity.set("name",  desingeController.property.get("name"));
	        					this.collection.add(switchEntity);
	        					//显示工作簿,这里的model不是switch区域所独有的，从design区域的property model作为其model
	        					this.switchViews = new SwitchRegion.Areas({
	        						collection: this.collection
	        					});
	        					/*
	        					 * 下面的两个监听一定要放在this.switchViews赋值后
	        					 */
	        					//监听新建工作区
	        					this.switchViews.on("switch:new", function(){
	        						this.newArea();
	        					}, this)
	        					//监听切换工作区,有前缀childview说明触发该事件的是孩子view
	        					this.switchViews.on("childview:area:switch", function(childView, i){
	        						this.switchArea(i);
	        					}, this);
	        					
	        					DataInsightManager.switchRegion.show(this.switchViews);
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