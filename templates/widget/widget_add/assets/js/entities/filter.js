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
			url: "/connect/distinct/" ,
			push: function(arg, val) {
			    var arr = _.clone(this.get(arg));
			    arr.push(val);
			    this.set(arg, arr);
			},
			defaults: {
				values: []//所有的值
			},
		})
		
		/**
		 * 真正的过滤器，提交给服务器的数据就放在这个model中
		 */
		Entities.BaseFilter = Backbone.Model.extend({
			defaults: {
				/*
				 * 过滤器列表,元素格式{filed:{name:xxx,calcFunc:xxx,table:xxx,kind:xxx},operator: "bw|in|not_in", value: []}
				 */
				filters: [],
				whichFilter: 0, //当前选中的过滤器
				values: [],//目前只放入因子变量字段对应表中的所有值,元素是个数组
			},
		})
		
		/**
		 * 用于和view打交道的过滤器
		 */
		Entities.Filter = Backbone.Model.extend({
			defaults: {
				/*
				 * 过滤器列表,元素格式{filed:{name:xxx,calcFunc:xxx,table:xxx,kind:xxx},operator: "bw|in|not_in", value: []}
				 */
				filters: [],
				whichFilter: 0, //当前选中的过滤器
				values: [],//目前只放入因子变量字段对应表中的所有值,元素是个数组
			},
			push: function(arg, val, options) {
			    var arr = _.clone(this.get(arg));
			    arr.push(val);
			    this.set(arg, arr, options);
			},
			/*toJSON: function(options){
				options = $.extend({}, options);
				var toJsonAttibutes = [];
				$.each(options, function(attribute, isToJson){
					if(isToJson){
						toJsonAttibutes.push(attribute);
					}
				})
				var jsonObj = {}, self = this;
				$.each(toJsonAttibutes, function(i, attribute){
					eval("jsonObj." + attribute + "= self.attributes." + attribute);
				})
				if(Object.keys(jsonObj).length == 0){
					return _.clone(this.attributes);
				}else{
					return _.clone(jsonObj);
				}
				
			},*/
			toJson: function(){
				return _.clone({
					filters: this.attributes.filters
				})
			},
			initialize: function(){
				var self = this;
				//创建状态，忽略抓取数据和触发filter:change的顺序，在filter模型改变的时候立即触发filter:change事件
				//this.listenChange();
				Entities.entAPI.setRelation("draw", this, 'filter:change');
				//监听获取某个字段的所有值
				this.on("fetch:field:values", function(data){
					var columnsNumber = this.get("values").length;
					//新加过滤器（新加字段）,这里不让触发change事件，等到后台拿到数据后手动通知视图重绘
					var field = {
							table: data.table, name: data.name,
							calcFunc: data.calcFunc, kind: data.kind
					}
					this.push("filters", {
						field: field, operator: "in",
						value: []
						}, {silent: true});
					this.set("whichFilter", columnsNumber, {silent: true});
					//如果是因子变量，则到后台抓取所有的数据
					if(data.kind == 'F'){
						var filterAssist = new Entities.filterAssist();
						//后台抓取新加的过滤器的所有不重复的值的集合（即是某个字段的所有值集合）
						filterAssist.fetch({
							data: {field: 	JSON.stringify({name: data.name, table: data.table})},
							/**
							 * 需要后台返回的数据格式为{values: [xxx,xxx,....]}
							 */
							success: function(model, respose){
								self.push("values", model.get("values"), {silent: true})
								//通知视图重新绘画,展现选中的过滤器值（选中的字段的所有值）
								self.trigger("filter:rerender");
							}
						});
					}else if(data.kind == "N"){//如果是数值变量
						self.push("values", []);//放入空的
						this.getCurrentFilter().operator = 'bw';
						this.getCurrentFilter().value = ["", ""];
						//通知视图重新绘画,展现选中的过滤器值
						this.trigger("filter:rerender");
					}
				});
				//监听选中过滤器的某个值
				this.on("value:select", function(value){
					this.getCurrentFilter().value.push(value);
					//通知入口model过滤器改变
					Entities.trigger("filter:change", this.toJson());
				})
				//监听取消选中过滤器的某个值
				this.on("value:notselect", function(value){
					this.getCurrentFilter().value.remove(value);
					//通知入口model过滤器改变
					Entities.trigger("filter:change", this.toJson());
				})
				
				//监听操作改变
				this.on("operate:change", function(operate){
					this.getCurrentFilter().operator = operate;
					if(this.getCurrentFilter().value.length > 0){
						//通知入口model过滤器操作改变
						Entities.trigger("filter:change", this.toJson());
					}
				});
				
				//监听清空所有的过滤器
				this.on("filters:clear", function(){
					this.set("values", [], {silent: true});
					this.set("filters", [], {silent: true});
					this.set("whichFilter", 0);
					//通知入口model过滤器清空
					Entities.trigger("filter:change", this.toJson());
				})
				
				//监听清空选中的值
				this.on("values:clear", function(){
					this.getCurrentFilter().value = [];
					//通知入口model过滤器清空了选中的值
					Entities.trigger("filter:change", this.toJson());
				})
				
				//监听选中过滤器
				this.on("select:filter", function(whichFilter){
					this.set("whichFilter", whichFilter, {silent: true});
					this.trigger("filter:rerender");
				})
				
				//监听删除过滤器
				this.on("filter:remove", function(whichFilter){
					//whichFilter是下标
					this.get("values").del(whichFilter);
					this.get("filters").del(whichFilter);
					this.set("whichFilter", 0);
					this.trigger("filter:rerender");
					//通知入口model删除过滤器
					Entities.trigger("filter:change", this.toJson());
				})
				
				//监听改变过滤器计算方式的改变
				this.on("calcFunc:change", function(calcFunc){
					this.getCurrentFilter().field.calcFunc = calcFunc;
					//通知入口model删除过滤器
					Entities.trigger("filter:change", this.toJson());
				})
				
				//监听获取数值变量过滤器的最低值
				this.on("lowRange:add", function(lowRange){
					this.getCurrentFilter().value[0] = lowRange;
					//通知入口model输入因子变量过滤器的下限
					Entities.trigger("filter:change", this.toJson());
				})
				//监听获取数值变量过滤器的最高值
				this.on("hightRange:add", function(hightRange){
					this.getCurrentFilter().value[1] = hightRange;
					//通知入口model输入因子变量过滤器的下限
					Entities.trigger("filter:change", this.toJson());
				})

			},
			getCurrentFilter: function(){
				if(this.get("filters").length > 0){
					return this.get("filters")[this.get("whichFilter")];
				}
			},
			/**
			 * 抓取数据，这里触发widget模型去后台抓取数据
			 */
			fetchFromWidget: function(){
				var defer = $.Deferred();
				var self = this;
				$.when(Entities.entAPI.getWidgetData()).done(function(resp) {
					self.set("values", resp.values);
					self.set("operators", resp.operators);
					self.set("filters", resp.filters);
					self.set("whichColum", 0);
                    defer.resolve();
                })
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
				/*//编辑状态
				if(window.widgetId && !window.newArea){
					//确保从后台抓取完数据后才监听属性改变事件，确保不会做无谓的触发
					$.when(this.fetchFromWidget()).done(function(){
						//只要模型的属性改变便通知widget模型改变属性
						self.on("change", function(){
							Entities.trigger("filter:change", this.toJSON());
							//通知视图重绘
							this.trigger("filter:rerender");
						}, self);
					});
					window.newArea = true;//防止在编辑的状态下，新建组件会从编辑的组件那里获取数据
					return true;
				}*/
				//创建状态
				this.on("change", function(){
					Entities.trigger("filter:change", this.toJSON());
					//通知视图重绘
					self.trigger("filter:rerender");
				}, this);
				return false;
			}
		})
		
		/**
		 * 对外暴露接口
		 */
		var API = {
				getFilterEntity: function(){
					var defer = $.Deferred()
					var filterEntity = new Entities.Filter();
					if(window.widgetId && !window.newArea){
						$.when(filterEntity.fetchFromWidget()).done(function(){
							defer.resolve(filterEntity);
							filterEntity.listenChange();
							//恢复完数据主动触发change事件
							filterEntity.trigger("change");
						})
					}else{
						defer.resolve(filterEntity);
						filterEntity.listenChange();
					}
					//filterEntity.fetchFromWidget();
					return defer.promise();
				}
		}
		
		DataInsightManager.reqres.setHandler("filter:entity", function(){
			return API.getFilterEntity();
		});
	})
	
	return FilterEntity;
})
