/**
 * 
 */
define([], function () {

	var GraphEntity = DataInsightManager.module("Entities", 
			function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Graph = Backbone.Model.extend({
			//url: "/widget/" + window.id,
			defaults: {
				graph: "bar",//组件图表类型
				axisX: [1,2],//组件x轴属性
				axisY: [1,2],//组件y轴属性
				mapping: {},//组件的映射字段，不同图表类型所需的映射字段列表不同
				/*shap: '',//组件的形状映射属性
				color: 'white',//组件的颜色映射属性
				size: 1,//组件大小映射属性
				fill: ''//组件填充字段映射属性*/				
			},
			initialize: function(){
				this.getMaping();
				//当图表类型改变的时候，触发事件，修改图表右边的视图
				this.on("change:graphType", function(graph){
					this.set("graph", graph);
					this.getMaping();
					//触发图表类型变化事件，通知'图表视图'更新，更新视图工作由图表视图完成
					this.trigger("change:feature", self.mapping);
					//TODO 更新作图区域
					
				}, this);
				
				this.on("change:axisX", function(){
					
				});

                Entities.entranceFascade.register("draw", this)
				
			},
			/*
			 * 抓取数据，这里出发widget模型去后台抓取数据
			 * 
			*/
			fecthFromWidget: function(){
				//通知widget模型去后台fetch数据，并且代替执行回调函数
				Entities.trigger("graph:initial", $.proxy(this.handlerData, this));
			},
			//通知wiget模型去后台fetch数据后代理执行的函数,这里只是初始化工作
			handlerData: function(data){
				this.graph = data.graph;
				this.axisX = data.axisX;
				this.axisY = data.axisY;
				this.mapping = data.mapping;
			},
			//获取图表类型对于的映射字段列表
			getMaping: function(){
				var map = {
					"area": ["alpha","colour", "fill", 
					         "linetype", "size"],
					"bar": ["alpha", "colour", "fill",
					        "linetype", "size", "weight"],
					"pie": ["alpha", "colour", "linetype", "size"],
					"boxplot": ["alpha", "colour", "fill",
					            "linetype", "shape", "size", "weight"],
					"line": ["alpha", "colour", "linetype", "size"],
					"map": ["alpha", "colour", "fill", "linetype",
					        "size", "map_id"],
					"path": ["alpha", "colour", "linetype", "size"],
					"point": ["alpha", "colour", "fill", 
					           "size", "shape"],
					"polygon": ["alpha", "colour", "fill", 
					              "linetype", "size", "group"],
					"ribbon": ["alpha", "colour", "fill", 
					              "linetype", "size"],
					"tile": ["alpha", "colour", "fill",
					              "linetype", "size"],
					"violin": ["alpha", "colour", "fill", "linetype",
					                "size", "weight"]
				}
				var featureArr = eval("map." + this.get("graph")),
					self = this;
				//默认的映射
				if(!featureArr){
					featureArr = ["alpha", "colour", "linetype", "size"];
				}
				//先清空先前的映射
				var mapping = {};
				$.each(featureArr, function(index, value){
					//根据先前定义好的映射创建mapping的属性，即确定该图表类型对应的字段映射列表
					eval("mapping." + value + "='1'");
				});
				self.set("mapping", mapping);
			}
		})
		
		/**
		 * 对外暴露接口
		 * getGraphEntity:获取
		 */
		var API = {
			 getGraphEntity: function(){
				 var id = window.widgetId;//TODO 这里获取后台传过来的id，如果是新建则为空
				 var graphEntity = new Entities.Graph();
				 graphEntity.fecthFromWidget();
				 return graphEntity;
				 /*var defer = $.Deferred();
				 if(!id){
					defer.resolve(graphEntity);
					 graphEntity.fetch({ 
						 data: {id: id},
						 success: function(model){
							 //如果是编辑组件的话，则设置deferred为成功状态
							 defer.resolve(model);
						 }
					 });
				 }else{
					 //如果是新建组件的话，则设置deferred为失败状态
					 defer.reject(graphEntity);
				 }
			     var promise = defer.promise();
			     return promise;*/
				 
			 },
		}
		
		//设置marionatte请求响应，获取图表实体
		DataInsightManager.reqres.setHandler("graph:entity", function(){
				return API.getGraphEntity();
		});
	})
	
	return GraphEntity;
})
