/**
 * 本controller是area区域的所有controller的容器,控制着整个area
 * 
 * 
 */
define([
	'region/show/controller',
	'region/design/controller',
    'region/switch/view'
], function() {
	var SwitchController = DataInsightManager.module("SwitchRegion"
	        , function(SwitchRegion, DataInsightManager, Backbone, Marionette, $, _) {
	        	
	        	SwitchRegion.Controller = function(){
	        		var obj = {
	        				initialize: function(){
	        					var self = this;
	        					this.designControllerList = [];
	        					this.showControllerList = [];
	        					this.newArea();
	        					//监听切换工作区
	        					SwitchRegion.Controller.on("area:switch", function(i){
	        						self.switchArea(i)
	        					})
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
	        					//显示工作簿,这里的model不是switch区域所独有的，从design区域的property model作为其model
	        					var switchView = new SwitchRegion.Area({
	        						model: desingeController.property
	        					});
	        					DataInsightManager.switchRegion.show(switchView);
	        				},
	        				/**
	        				 * 切换工作簿
	        				 * @param index:第几个工作区
	        				 */
	        				switchArea: function(index){
	        					//获取指定工作簿
	        					var selectDesignController = this.designControllerList[index];
	        					var showShowController = this.showControllerList[index];
	        					//显示工作簿
	        					var switchView = new SwitchRegion.Area({
	        						model: desingeController.property
	        					});
	        					DataInsightManager.switchRegion.show(switchView);
	        				}
	        		}
	        		obj.initialize();
	        		return obj;
	        	}
	        });
	return SwitchController;
})