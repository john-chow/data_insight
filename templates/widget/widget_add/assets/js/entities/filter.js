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
				inValues: [],//字段值中选中的值
				exValues: [],//字段值中排除的值
				values: []//所有的值
			},
		})
		/**
		 * 过滤器辅助类集合
		 */
		Entities.filterAssists = Backbone.Collection.extend({
			model: Entities.filterAssist,
		})
		
		Entities.Filter = Backbone.Model.extend({
			defaults: {
				filters: [],//过滤器列表,形式[{table: xxx, name: xxx, kind: xxx},{table: xxx, name: xxx, kind: xxx}],table为表名，name为字段名, kind为数值类型
				values: [],//过滤器的值,元素是过滤器辅助类
				operators: [],//操作，有include和exclude，分别表示选中和排除
				ranges: [],//范围，数值变量的时候选择区间，元素是两个元素的数组，如[1,2],表示选中的过滤器是数值型的而且范围在1和2之间的
				operate: 'include',//选中/排除/>/</>=/<=/[]
				whichColumn: 0//选中的过滤器下标,默认选中第一个
			},
			push: function(arg, val, options) {
			    var arr = _.clone(this.get(arg));
			    arr.push(val);
			    this.set(arg, arr, options);
			},
			initialize: function(){
				var self = this;
				//创建状态，忽略抓取数据和触发filter:change的顺序，在filter模型改变的时候立即触发filter:change事件
				this.listenChange();
				Entities.entAPI.setRelation("draw", this, 'filter:change');
				//监听获取某个字段的所有值
				this.on("fetch:field:values", function(data){
					var columnsNumber = this.get("values").length;
					//新加过滤器（新加字段）,这里不让触发change事件，等到后台拿到数据后手动通知视图重绘
					this.push("filters", {
						table: data.table, name: data.name,
						kind: data.kind
						}, {silent: true});
					//如果是数值变量，则到后台抓取所有的数据
					if(data.kind == 'N'){
						this.push("values", new Entities.filterAssist(), {silent: true});
						this.push("operators", "include");
						var filterAssist = this.get("values")[columnsNumber];
						//后台抓取新加的过滤器的所有不重复的值的集合（即是某个字段的所有值集合）
						filterAssist.fetch({
							data: {field: 	JSON.stringify({name: data.name, table: data.table})},
							/**
							 * 需要后台返回的数据格式为[{values: [xxx,xxx,....]},{values: [xxx,xxx,....]}]
							 */
							success: function(model, respose){
								self.set("whichColumn", columnsNumber, {silent: true});
								//通知视图重新绘画,展现选中的过滤器值（选中的字段的所有值）
								self.trigger("filter:rerender");
							}
						});
					}else if(data.kind == "F"){//如果是因子变量
						this.push("ranges", ["",""]);
						this.push("values", null, {silent: true});
						this.push("operators", null);
						self.trigger("filter:rerender");
					}
				});
				//监听选中过滤器的某个值
				this.on("filter:select", function(value){
					//选中
					if(this.get("operators")[this.get("whichColumn")] == "include"){
						this.get("values")[this.get("whichColumn")].push("inValues", value);
					}
					//排除
					else if(this.get("operators")[this.get("whichColumn")] == "exclude"){
						this.get("values")[this.get("whichColumn")].push("exValues", value);
					}
					//通知入口model过滤器改变
					Entities.trigger("filter:change", this.toJSON());
				})
				//监听取消选中过滤器的某个值
				this.on("filter:notselect", function(value){
					//选中
					if(this.get("operators")[this.get("whichColumn")] == "include"){
						this.get("values")[this.get("whichColumn")].get("inValues").remove(value);
					}
					//排除
					else if(this.get("operators")[this.get("whichColumn")] == "exclude"){
						this.get("values")[this.get("whichColumn")].get("exValues").remove(value);
					}
					//通知入口model过滤器改变
					Entities.trigger("filter:change", this.toJSON());
				})
				
				//监听操作改变
				this.on("operate:change", function(operate){
					if(this.get("filters").length > 0){
						//之前排除，现在选中的情况
						if(operate == "include"){
							var beforeExValues = this.get("values")[this.get("whichColumn")].get("exValues");
							this.get("values")[this.get("whichColumn")].set("inValues", beforeExValues);
							this.get("values")[this.get("whichColumn")].set("exValues", []);
						}else if(operate == "exclude"){//之前选中，现在排除的情况
							var beforeInValues = this.get("values")[this.get("whichColumn")].get("inValues");
							this.get("values")[this.get("whichColumn")].set("exValues", beforeInValues);
							this.get("values")[this.get("whichColumn")].set("inValues", []);
						}
						this.get("operators")[this.get("whichColumn")] = operate;
						//通知入口model过滤器操作改变
						Entities.trigger("filter:change", this.toJSON());
					}
				});
				
				//监听清空所有的过滤器
				this.on("filters:clear", function(){
					this.set("values", [], {silent: true});
					this.set("filters", [], {silent: true});
					//通知入口model过滤器清空
					Entities.trigger("filter:change", this.toJSON());
				})
				
				//监听清空选中的值
				this.on("values:clear", function(){
					if(this.get("operators")[this.get("whichColumn")] == "include"){
						//清空选中值
						this.get("values")[this.get("whichColumn")].set("inValues", []);
					}else if(this.get("operators")[this.get("whichColumn")] == "exclude"){
						//清空排除值
						this.get("values")[this.get("whichColumn")].set("exValues", []);
					}
					//通知入口model过滤器清空了选中的值
					Entities.trigger("filter:change", this.toJSON());
				})
				
				//监听选中过滤器
				this.on("select:filter", function(whichFilter){
					this.set("whichColumn", whichFilter, {silent: true});
					this.trigger("filter:rerender");
				})
				
				//监听删除过滤器
				this.on("filter:remove", function(whichFilter){
					var removeValue = this.get("values")[whichFilter];
					var removeFilter = this.get("filters")[whichFilter];
					this.get("values").remove(removeValue);
					this.get("filters").remove(removeFilter);
					this.trigger("filter:rerender");
					//通知入口model删除过滤器
					Entities.trigger("filter:change", this.toJSON());
				})

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
				if(window.widgetId && !window.newArea){
					//确保从后台抓取完数据后才监听属性改变事件，确保不会做无谓的触发
					$.when(this.fetchFromWidget()).done(function(){
						//只要模型的属性改变便通知widget模型改变属性
						self.on("change", function(){
							Entities.trigger("filter:change", this.toJSON());
							//通知视图重绘
							this.trigger("filter:rerender");;
						}, self);
					});
					window.newArea = true;//防止在编辑的状态下，新建组件会从编辑的组件那里获取数据
					return true;
				}
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
