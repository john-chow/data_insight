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
				//创建状态，忽略抓取数据和触发filter:change的顺序，在filter模型改变的时候立即触发filter:change事件
				this.listenChange();
			},
			/**
			 * 抓取数据，这里触发widget模型去后台抓取数据
			 */
			fetchFromWidget: function(){
				var defer = $.Deferred();
				Entities.trigger("design:initial", { 
					"func": $.proxy(this.handlerData, this),
					"arg" : defer
				});
				return defer.promise();
			},
			/**
			 * 通知wiget模型去后台fetch数据后代理执行的函数
			 * data:后台返回的response， defer：fetchFromWidget函数里面的jquery deferred
			 */
			handlerData: function(data, defer){
				this.filter = data.filter;
				defer.resolve();
			},
			/**
			 *说明：如果是编辑状态，则在抓取完后台数据后再监听change事件,否则直接监听
			 *return ture对应编辑状态，false对应创建状态
			 */
			listenChange: function(){
				var self = this;
				//编辑状态
				if(window.wigetId){
					//确保从后台抓取完数据后才监听属性改变事件，确保不会做无谓的触发
					$.when(this.fecthFromWidget()).done(function(){
						//只要模型的属性改变便通知widget模型改变属性
						self.on("change", function(){
							Entities.trigger("filter:change", this.toJSON());
						}, this);
					});
					return true;
				}
				//创建状态
				this.on("change", function(){
					Entities.trigger("filter:change", this.toJSON());
				}, this);
				return false;
			}
		})
		
		/**
		 * 对外暴露接口
		 */
		var API = {
				getFilterEntity: function(){
					var filterEntity = new Entities.Filter();
					//filterEntity.fetchFromWidget();
					return filterEntity;
				}
		}
		
		DataInsightManager.reqres.setHandler("filter:entity", function(){
			return API.getFilterEntity();
		});
	})
	
	return FilterEntity;
})