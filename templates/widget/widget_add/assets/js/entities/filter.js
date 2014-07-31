/**
 * 
 */
define([], function () {

	var FilterEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Filter = Backbone.Model.extend({
			defaults: {
				filter: ""
			},
			initialize: function(){
				var self = this;
				
			},
			fetchFromWidget: function(){
				//通知widget模型去后台fetch数据，并且代替执行回调函数
				Entities.trigger("graph:initial", $.proxy(this.handlerData, this));
			},
			//通知wiget模型去后台fetch数据后代理执行的函数
			handlerData: function(data){
				this.filter = data.filter;
			},
		})
		
		/**
		 * 对外暴露接口
		 */
		var API = {
				getFilterEntity: function(){
					var filterEntity = new Entities.Filter();
					filterEntity.fetchFromWidget();
					return filterEntity;
				}
		}
		
		DataInsightManager.reqres.setHandler("filter:entity", function(){
			return API.getFilterEntity();
		});
	})
	
	return FilterEntity;
})