/**
 * 
 */
define([
    "entities/entrance"
], function () {

	var PropertyEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Property = Backbone.Model.extend({
			defaults: {
				name: "组件",
				title: '组件',
				style: "default",
				autoRefresh: "1h",
				isPublish: "true",//组件是否发布
			},
			initialize: function(){
				var self = this;
				//this.listenChange();
                Entities.entAPI.setRelation("additional", this, "property:change");
                this.listenPropertyChange();
			},
			/**
			 * 抓取数据，这里触发widget模型去后台抓取数据
			 * 备注：触发wiget模型抓取数据的时候，传了回调函数和defer对象过去
			 * return jquery deferrd的promise()方法，确保defer对象无法从外部改变
			 */
			fecthFromWidget: function(){
                var self = this;
                $.when(Entities.entAPI.getWidgetData()).done(function(resp) {
                    self.handlerData(resp)
                })
			},
			/**
			 * 通知wiget模型去后台fetch数据后代理执行的函数
			 * data:后台返回的response， defer：fetchFromWidget函数里面的jquery deferred
			 */
			handlerData: function(data){
				this.set("name", data.name, {silent: true});
				this.set("title", data.title, {silent: true});
				this.set("style", data.style, {silent: true});
				this.set("autoRefresh", data.autoRefresh, {silent: true});
				this.set("isPublish", data.isPublish, {silent: true});
			},
			/**
			*说明：如果是编辑状态，则在抓取完后台数据后再监听change事件,否则直接监听
			*return ture对应编辑状态，false对应创建状态
			*/
			listenChange: function(){
				var self = this;
				//编辑状态
				if(window.widgetId && !window.newArea){
					//确保从后台抓取完数据后才监听属性改变事件，确保不会做无谓的触发
					$.when(this.fecthFromWidget()).done(function(){
						//只要模型的属性改变便通知widget模型改变属性
						self.on("change", function(){
							Entities.trigger("property:change", this.toJSON());
						}, self);
						//拉完数据要通知model发生了change事件
						self.trigger("change");
					});
					window.newArea = true;//防止在编辑的状态下，新建组件会从编辑的组件那里获取数据
					return true;
				}
				//创建状态，忽略抓取数据和触发property:change的顺序，在property模型改变的时候立即触发property:change事件
				this.on("change", function(){
					Entities.trigger("property:change", this.toJSON());
				}, this);
				return false;
			},
			/**
			 * 监听各个属性的变化
			 */
			listenPropertyChange: function(){
                this.on("style:change", function(style){
                	this.set("style", style, {silent : true});//不触发change事件
                	//通知入口model主题改变
                	Entities.trigger("style:change", this.toJSON());
                }, this);
                this.on("autoRefresh:change", function(autoRefresh){
                	this.set("autoRefresh", autoRefresh, {silent : true});//不触发change事件
                	//通知入口model更新周期改变
                	Entities.trigger("autoRefresh:change", this.toJSON());
                }, this);
                this.on("isPublish:change", function(isPublish){
                	this.set("isPublish", isPublish, {silent : true});//不触发change事件
                }, this);
                this.on("title:change", function(title){
                	this.set("title", title, {silent : true});//不触发change事件
                	this.set("name", title, {silent : true});
                	//通知switch model修改名字
                	Entities.trigger("name:change", title);
                }, this);
			}
		});
		
		/**
		 * 对外暴露接口
		 */
		var API = {
			getPropertyEntity: function(){
				var propertyEntity = new Entities.Property();
				return propertyEntity;
			}
		}
		
		DataInsightManager.reqres.setHandler("property:entity", function(){
			return API.getPropertyEntity();
		});
	})
	
	return PropertyEntity;
})
