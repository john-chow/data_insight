/**
 * 
 */
define([
    "entities/entrance"
], function () {

	var FilterEntity = DataInsightManager.module("Entities", function(Entities, DataInsightManager, Backbone, Marionette, $, _){
		/**
		 * 过滤器辅助类
		 */
		Entities.filterAssist = Backbone.Model.extend({
			defaults: {
				inValues: [],//字段值中选中的值
				exValues: []//字段值中排除的值
			},
		})
		/**
		 * 过滤器辅助类集合
		 */
		Entities.filterAssists = Backbone.Collection.extend({
			url: "/connect/distinct/" ,
			model: Entities.filterAssist,
		})
		
		Entities.Filter = Backbone.Model.extend({
			defaults: {
				fields: [],//过滤器列表,形式[{table: xxx, name: xxx},{table: xxx, name: xxx}],table为表名，name为字段名
				values: [],//过滤器的值,元素师过滤器辅助类集合的集合
				operate: 'include',//选中/排除/>/</>=/<=/[]
				whichColumn: 0//选中的过滤器下标,默认选中第一个
			},
			push: function(arg, val) {
			    var arr = _.clone(this.get(arg));
			    arr.push(val);
			    this.set(arg, arr);
			},
			initialize: function(){
				var self = this;
				//创建状态，忽略抓取数据和触发filter:change的顺序，在filter模型改变的时候立即触发filter:change事件
				this.listenChange();
				Entities.entAPI.setRelation("draw", this, 'filter:change');
				//监听获取某个字段的所有值
				this.on("fetch:field:values", function(data){
					var columnsNumber = this.get("columns").length;
					//新加过滤器（新加字段）
					this.push("values", new Entities.filterAssists());
					var filterAssists = this.get("values")[columnsNumber].values;
					//后台抓取新加的过滤器的所有不重复的值的集合（即是某个字段的所有值集合）
					filterAssists.fetch({
						data: {filed: data},
						type: "get",
						/**
						 * 需要后台返回的数据格式为[{inValues: [xxx,xxx,....], exValues: [xxx,xxx,....]},{inValues: [xxx,xxx,....], exValues: [xxx,xxx,....]}]
						 */
						success: function(collection, respose){
							self.set("whichColumn", columnsNumber, {silent: true});
							//通知视图重新绘画,展现选中的过滤器值（选中的字段的所有值）
							self.trigger("filter:rerender");
						}
					});
				})

			},
			/**
			 * 获取字段的所有值集合
			 * @prame data的形式{column:xxxx,table:xxxx}
			 */
			fetchFiledValues: function(data){
				//通知入口model获取指定的字段的所有值的集合，字段和表名在data中
				Entities.trigger("fetch:field:values", {
					"func": $.proxy(this.handlerFetcFiledVals, this),
					"arg" : data
					
				});
			},
			/**
			 * 入口model代理执行的函数，当获取完指定字段的所有值后执行
			 * @parme data,字段的所有值的集合; defer, jquery Deferred对象
			 */
			handlerFetcFiledVals: function(data, defer){
				this.values = data;//不用model的set方法
				defer.resolve();
                Entities.entranceFascade.register("draw", this, "filter:change")
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
				//this.filter = "color = 'blue' or color = 'red' and size=1 or size=2";
				if(this.filter.length > 0){
					//过滤器中的字段
					var columns = this.filter.split(/\s+and\s+/);
					for(var i = 0; i<columns.length; i++){
						var filterAssists = new Entities.filterAssists();
						//字段中对应选中的值
						var values = columns[i].split(/\s+or\s+/);
						for(var j = 0; j<values.length; j++){
							var filterAssist = new Entities.filterAssist();
							var kv = values[j].split(/\s*=\s*/);
							filterAssist.set({value: kv[1], isSelect: true});
							filterAssists.add(filterAssist);
						}
						this.push("columns", {name: kv[0], values: filterAssists});
					}
				}
				defer.resolve();
			},
			/**
			 *说明：如果是编辑状态，则在抓取完后台数据后再监听change事件,否则直接监听
			 *return ture对应编辑状态，false对应创建状态
			 */
			listenChange: function(){
				var self = this;
				//编辑状态
				if(window.widgetId){
					//确保从后台抓取完数据后才监听属性改变事件，确保不会做无谓的触发
					$.when(this.fetchFromWidget()).done(function(){
						//只要模型的属性改变便通知widget模型改变属性
						self.on("change", function(){
							Entities.trigger("filter:change", this.toJSON());
							//通知视图重绘
							//this.trigger("filter:change");
						}, this);
					});
					return true;
				}
				//创建状态
				this.on("change", function(){
					Entities.trigger("filter:change", this.toJSON());
					//通知视图重绘
					//this.trigger("filter:change");
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
