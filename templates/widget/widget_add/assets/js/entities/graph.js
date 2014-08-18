/**
 * 
 */
define([
    "entities/entrance"
], function () {
	var GraphEntity = DataInsightManager.module("Entities", 
			function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		Entities.Graph = Backbone.Model.extend({
			//url: "/widget/" + window.id,
			defaults: {
				graph: "bar",//组件图表类型
				x: [],//组件x轴属性
				y: [],//组件y轴属性
				mapping: {},//组件的映射字段，不同图表类型所需的映射字段列表不同
				/*shap: '',//组件的形状映射属性
				color: 'white',//组件的颜色映射属性
				size: 1,//组件大小映射属性
				fill: ''//组件填充字段映射属性*/				
			},
			/**
			 * 该方法修复backbone里面数组属性为全局变量的bug，如果backbone里面有数组属性，要给这个
			 * 数组属性再添加一个元素进去，调用这个push方法，不要调用js Array的push方法
			 */
			push: function(arg, val) {
			    var arr = _.clone(this.get(arg));
			    arr.push(val);
			    this.set(arg, arr);
			},
			initialize: function(){
				var self = this;
				//映射关系
				this.map = {
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
					};
				this.graph = this.get("graph");
				this.getMaping();
				this.listenChange();
				//当图表类型改变的时候，触发事件，修改图表右边的视图
				this.on("graphType:change", function(graph){
					this.graph = graph;
					this.getMaping();
					/*//触发图表类型变化事件，通知'图表视图'更新，更新视图工作由图表视图完成
					this.trigger("feature:change", self.mapping);*/
					
				}, this);
				
				//删除x轴中的元素的操作
				this.on("x:remove", function(xItem){
					this.get("x").remove(xItem);
					this.trigger("change");//触发change事件;
				}, this);
				
				//删除y轴中的元素操作
				this.on("y:remove", function(yItem){
					this.get("y").remove(yItem);
					this.trigger("change");//触发change事件;
				}, this);

                Entities.entAPI.setRelation("draw", this, "graph:change")
				
				//添加x轴被拖进来的元素
				this.on("x:add", function(xItem){
					this.push("x", xItem);//会触发change事件
					//this.trigger("change");//触发change事件
				}, this);
				
				//添加y轴被拖进来的元素
				this.on("y:add", function(yItem){
					this.push("y", yItem);//会触发change事件
					//this.trigger("change");//触发change事件
				}, this);
				
				//监听通过模态框修改x轴属性的变化,因为是垮model的所以绑定在Entities上
				Entities.on("x:change", function(data){
					$.each(self.get('x'), function(i, value){
						if(value.name == data.name){
							self.get('x')[i].title = data.title;
							self.get('x')[i].calcFunc = data.calcFunc;
							self.get('x')[i].kind = data.kind;
							self.trigger("change");//触发change事件
							//通知graph视图更新视图
							//self.trigger("axis:change");
							return;
						}
					})
				});
				
				//监听通过模态框修改y轴属性的变化,因为是垮model的所以绑定在Entities上
				Entities.on("y:change", function(data){
					$.each(self.get('y'), function(i, value){
						if(value.name == data.name){
							self.get('y')[i].title = data.title;
							self.get('y')[i].calcFunc = data.calcFunc;
							self.get('y')[i].kind = data.kind;
							self.trigger("change");//触发change事件
							//通知graph视图更新视图
							//self.trigger("axis:change");
							return;
						}
					})
				});
				
				//监听将字段拖拽到图表类型对应的字段列表中的某个列表项中
				this.on("mapping:add", function(data){
					eval("this.get('mapping')." + data.name + "={column:'" +
						  data.column + "', table:" + "'" + data.table + "'}");
					this.trigger("change");//触发change事件
				}, this);
				
				//监听将字段从图表类型对应的字段列表项中脱离或者删除
				this.on("mapping:remove", function(data){
					eval("this.get('mapping')." + data.name + "={}");
					this.trigger("change");//触发change事件
				}, this);
			},
			/**
			 * 抓取数据，这里触发widget模型去后台抓取数据
			 * 
			*/
			fecthFromWidget: function(){
                var self = this;
                var defer = $.Deferred();
                $.when(Entities.entAPI.getWidgetData()).done(function(resp) {
                	self.set("graph", resp.graph, {silent: true});
                	self.set("x", resp.x, {silent: true});
                	self.set("y", resp.y, {silent: true});
                	self.set("mapping", resp.mapping, {silent: true});
                	defer.resolve();
                })
                return defer.promise();
			},
			/**
			 * 获取图表类型对于的映射字段列表
			 */
			getMaping: function(){
				var self = this,
					featureArr = eval("this.map." + this.graph);
				//默认的映射
				if(!featureArr){
					featureArr = ["alpha", "colour", "linetype", "size"];
				}
				//先清空先前的映射
				var mapping = {};
				//根据先前定义好的映射创建mapping的属性，即确定该图表类型对应的字段映射列表
				$.each(featureArr, function(index, value){
					if(!(value in self.get("mapping"))){
						eval("mapping." + value + "={}")
					}else{
						eval("mapping." + value + "=self.get('mapping')." + value);
					}
				});
				self.set({mapping : mapping, graph: this.graph});//会触发change事件
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
						self.on("change", function(){
							//通知入口model图表发生改变
							Entities.trigger("graph:change", this.toJSON());
							//通知视图重画
							self.trigger("graph:change");
						}, self);
						self.trigger("change");
					});
					window.newArea = true;//防止在编辑的状态下，新建组件会从编辑的组件那里获取数据
					return true;
				}
				//创建状态，忽略抓取数据和触发graph:change的顺序，在graph模型改变的时候立即触发garph:change事件
				this.on("change", function(){
					//通知入口model图表发生改变
					Entities.trigger("graph:change", this.toJSON());
					//通知视图重画
					self.trigger("graph:change");
				}, this);
				return false;
			}
		})
		
		/**
		 * 对外暴露接口
		 * getGraphEntity:获取图表实体，如果是编辑的情况下则会去后台抓取。新建的情况下只是新建一个图表实体（没值）
		 */
		var API = {
			 getGraphEntity: function(){
				 var id = window.widgetId;//TODO 这里获取后台传过来的id，如果是新建则为空
				 var graphEntity = new Entities.Graph();
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
