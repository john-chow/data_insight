/**
 * 
 */
define([], function () {

	var PropertyEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Property = Backbone.Model.extend({
			defaults: {
				name: "组件",
				title: '标题',
				style: "default",
				autoRefresh: "1h",
				isPublish: "false",//组件是否发布
			},
			initilize: function(){
				var self = this;
			},
			/*
			 * 通知wiget模型去后台fetch数据后代理执行的函数
			 */
			handlerData: function(data){
				this.name = data.name;
				this.title = data.title;
				this.style = data.style;
				this.autoRefresh = data.autoRefresh;
				this.isPublish = data.isPublish;
				
			},
			/*
			 * 通知widget模型去后台fetch数据，并且代替执行回调函数
			 */
			fecthFromWidget: function(){
				Entities.trigger("graph:initial", $.proxy(this.handlerData, this));
			}
		});
		
		/**
		 * 对外暴露接口
		 */
		var API = {
			getPropertyEntity: function(){
				var propertyEntity = new Entities.Property();
				propertyEntity.fecthFromWidget();
				return propertyEntity;
			}
		}
		
		DataInsightManager.reqres.setHandler("property:entity", function(){
			return API.getPropertyEntity();
		});
	})
	
	return PropertyEntity;
})