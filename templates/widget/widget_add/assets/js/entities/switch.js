/**
 * 工作簿实体
 */
define([], function () {

	var SwitchEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Switch = Backbone.Model.extend({
			defaults: {
				name: "组件",
			},
			initialize: function(){
			},
		})
		
		Entities.Switchs = Backbone.Collection.extend({
			model: Entities.Switch
		})
		
		/**
		 * 对外暴露接口
		 */
		var API = {
			getSwitchEntity: function(){
				return new Entities.Switch()
			},
			getSwitchEntities: function(){
				return new Entities.Switchs();
			}
		};
		
		DataInsightManager.reqres.setHandler("switch:entity", function(){
			return API.getSwitchEntity();
		});
		
		DataInsightManager.reqres.setHandler("switch:entities", function(){
			return API.getSwitchEntities();
		});
		
	})
	
	return SwitchEntity;
})