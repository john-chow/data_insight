/**
 * x轴或者y轴实体
 */
define([], function () {

	var AxisEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Axis = Backbone.Model.extend({
		})
		
		Entities.Axises = Backbone.Collection.extend({
			model: Entities.Axis
		})
		
		/**
		 * 对外暴露接口
		 */
		var API = {
				getAxisEntity: function(){
					var axisEntity = new Entities.Axis();
					return axisEntity;
				},
				getAxisEntities: function(){
					var axisEntities = new Entities.Axises();
					return axisEntities;
				}
		}
		
		DataInsightManager.reqres.setHandler("axis:entities", function(){
			return API.getAxisEntities();
		});
		
		DataInsightManager.reqres.setHandler("axis:entity", function(){
			return API.getAxisEntity();
		});
	})
	
	return AxisEntity;
})