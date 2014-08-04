/**
 * x轴或者y轴实体
 */
define([], function () {

	var AxisEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Axis = Backbone.Model.extend({
			defaults: {
				name: "",
				title: "",
				calcFunc: "none",
				
			},
			initialize: function(){
				this.on("axis:change", function(data){
					this.set('title', data.title);
					this.set('calcFunc', data.calcFunc);
					if(data.axis == "x")//改变x轴的元素
						Entities.trigger("x:change", this.toJSON());
					else//改变y轴的元素
						Entities.trigger("y:change", this.toJSON());
				}, this);
			},
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