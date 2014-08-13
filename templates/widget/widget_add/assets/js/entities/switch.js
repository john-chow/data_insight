/**
 * 工作簿实体
 */
define([], function () {

	var SwitchEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Switch = Backbone.Model.extend({
			defaults: {
				name: "组件",
			}
		})
		
		Entities.Switchs = Backbone.Collection.extend({
			model: Entities.Switch,
			initialize: function(){
				/*监听组件名字改变，在组件属性中，修改名字的时候会触发，由property model触发
				 * 注意是绑定在Entities上，所以下面触发的事件肯定是要绑定在switch的CollectionView的
				*/
				Entities.on("name:change", function(name){
					//通知switch视图(collectionView,如果是itemView会多次触发)，名字显示为修改后的
					this.trigger("name:change", name);
				}, this);
			},
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