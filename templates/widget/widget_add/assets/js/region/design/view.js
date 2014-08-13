define([
"text!region/design/template/region_design.html", 
"text!region/design/template/view_graph.html", 
"text!region/design/template/view_filter.html", 
"text!region/design/template/view_property.html", 
"text!region/design/template/dialog_edit_x.html",
"text!region/design/template/dialog_edit_y.html"
], function(regionDesignTemplate, graphViewTemplate, filterViewTemplate, propertyViewTemplate,
				dialogEditXTemplate, dialogEditYTemplete){
	var DesignRegionView = DataInsightManager.module("DesignRegion",
		    function(DesignRegion, DataInsightManager, Backbone, Marionette, $, _){
		
		//过滤器视图
		DesignRegion.Filter = Marionette.ItemView.extend({
			template: filterViewTemplate,
			initialize: function(){
				//监听过滤器属性改变的，当改变，视图重绘
				this.model.on("filter:change", function(){
					this.render();
				}, this);
			},
			onShow: function(){
				var self = this;
				this.$el.find(".myfilter").droppable({
					drop: function(event, ui){
						var fieldName = ui.helper.data("filedname");
						//通知model获取fieldName字段的所有值的集合
						self.model.trigger("fetch:field:values", {
								column: fieldName, table: $(".table-item-choosed").data("table")
							});
						}
				});
			}
		})
		
		
		//属性视图
		DesignRegion.Property = Marionette.ItemView.extend({
			template: propertyViewTemplate,
			onShow: function(){
				//显示值
				$("[name=style]").val(this.model.get("style"));
				$("[name=autoRefresh]").val(this.model.get("autoRefresh"));
				$("[name=isPublish]").val(this.model.get("isPublish"));
				
				this.whenChange();
			},
			/**
			 * 监听各个属性的变化，jquery监听，触发后通知property model更新
			 */
			whenChange: function(){
				var self = this;
				//监听样式下拉框的变化，实时重画
				$("[name=style]").on("change", function(){
					//通知property model更新style属性
					self.model.trigger("style:change", $(this).val());
				});
				//监听更新频率下拉框的变化
				$("[name=autoRefresh]").on("change", function(){
					//通知property model更新autoRefresh属性
					self.model.trigger("autoRefresh:change", $(this).val());
				});
				/*$("[name=title]").bind("input propertychange", function(){
					console.log($(this).val());
				})*/
				//监听标题输入框的值的改变
				$("[name=title]").on("change", function(){
					self.model.trigger("title:change", $(this).val());
				});
				//监听是否发布下拉框的变化
				$("[name=isPublish]").on("change", function(){
					self.model.trigger("isPublish:change", $(this).val());
				});
			}
		})
		
		
		//图表视图
		DesignRegion.Graph = Marionette.ItemView.extend({
			template: graphViewTemplate,
			//调用完layoutview的show或者region的show方法后，触发
			initialize: function(){
				/*//当改变图表类型的时候触发，更新图表视图
				this.model.on("feature:change", function(mapping){
					this.render();//重新render后等于新建视图，则在onShow方法绑定的事件失效
				}, this);
				//当x、y轴属性改变的时候触发，更新图表视图
				this.model.on("axis:change", function(){
					this.render();
				}, this);*/
				//视图model发生改变的时候重新渲染,该代码替代上面注解的代码
				this.model.on("graph:change", function(){
					this.render();
				}, this);
				
			},
			/**
			 * 允许字段视图下的指定字段名的字段可以拖拽
			 * @param filedName 字段名
			 */
			enableFiledDrage: function(filedName){
				var $selectedFiledEl = $("#filed_" + filedName);
				$selectedFiledEl.css("cursor", "move");
				$selectedFiledEl.draggable("enable");
			},
			/**
			 * 禁止许字段视图下的指定字段名的字段可以拖拽
			 * @param filedName 字段名
			 */
			disableFiledDrage: function(filedName){
				var $selectedFiledEl = $("#filed_" + filedName);
				$selectedFiledEl.css("cursor", "not-allowed");
				$selectedFiledEl.draggable("disable");
			},
			onShow: function(){
				var self = this;
				$(".select-graph .charts").each(function(){
					var type = $(this).data("graph");
					$(".select-graph").on("click", ".chart-" + type , function(){
						//触发改变图表类型事件,更新操作由图表model完成
						self.model.trigger("graphType:change", type);
					});
				});
				this.setDragProperty();
				this.setFeatureDroppable();
				//监听x轴y轴的操作
				$("#x_sortable").on("click", ".coordinate-remove a", function(e){
					var xItem = $(e.target).data("xitem");
					self.model.trigger("x:remove", xItem);
					$(e.target).parents(".measure").remove();
					self.enableFiledDrage(xItem.name);
				});
				$("#y_sortable").on("click", ".coordinate-remove a", function(e){
					var yItem = $(e.target).data("yitem");
					self.model.trigger("y:remove", yItem);
					$(e.target).parents(".mension").remove();
					self.enableFiledDrage(yItem.name);
				});
				//监听编辑x轴y轴中元素编辑的操作
				$("#x_sortable").on("click", ".coordinate-edit a", function(e){
					var xItem = $(e.target).data("xitem");
					self.trigger("x:edit", xItem);
				});
				$("#y_sortable").on("click", ".coordinate-edit a", function(e){
					var yItem = $(e.target).data("yitem");
					self.trigger("y:edit", yItem);
				});
				
				//监听图表类型对应的属性列表类型删除的时候
				$(".feature").on("click", "span", function(){
					var $this = $(this);
					var name = $this.parent().attr("name");
					var column = $this.data("filedname");
					var table = $(".table-item-choosed").data("table");
					self.model.trigger("mapping:remove", {
						name: name,
						column: column,
						table: table
					});
				})
				
				//如果字段(filed)已经被拖入到x或者y轴中，则禁止filed区域对应的字段不让拖拽
				/*$.each(this.model.get("x"), function(index, value){
					self.disableFiledDrage(value.name);
				});
				$.each(this.model.get("y"), function(index, value){
					self.disableFiledDrage(value.name);
				});*/
			},
			//调用该view的render方法触发
			onRender: function(){
				this.onShow();
			},
			/*
			 * 设置x轴，y轴的排序拖拽,以及相应事件处理
			 */
			setDragProperty: function(e){
				var self = this;
				$("#x_sortable,#y_sortable").sortable({
					connectWith: ".connectedSortable",
					//revert: true,
					zIndex: "3000",
					//placeholder: "ui-state-highlight",
					cursor: "default",
					//所有的回调函数接受两个参数: 浏览器事件和ui对象
					start: function(event,ui) { //这个事件在排序开始时触发
						
					},
					sort: function(event,ui) {  //这个事件在排序时触发
					},
					change: function(event,ui) { //这个事件在排序时触发,但是仅仅在对象在DOM中的位置改变时才会触发.
					},
					beforeStop: function(event,ui) {  //这个事件在排序停止时触犯,但仅仅在placeholder/helper依然存在时触发.
					},
					stop: function(event,ui) { //这个事件在排序停止时触发.
					},
					update: function(event,ui) { //这个事件在用户停止排序并且DOM节点位置发生改变时出发.
						
					},
					receive: function(event,ui) { //这个时间在一个已连接的sortable接收到来自另一个列表的元素时触发.
						//判断x轴还是y轴的标志
						var axis = $(this).attr("id") == "x_sortable" ? "x" : "y";
						//坐标某个元素的序列化
						var axisItem = ui.item.data("axisitem");
						//字段名
						var name = axisItem.name;
						//显示标题
						var title = axisItem.title == undefined ? name : axisItem.title;
						//计算函数
						var calcFunc = axisItem.calcFunc == undefined ? "none" : axisItem.calcFunc;
						//计算类型(对应关系:{N:数值变量,F:因子变量,D:时间变量,G:地理变量,T:逻辑变量})
						var kind = axisItem.kind;
						//字段所属数据表
						var table = $(".table-item-choosed").data("table");
						var addXItem = {
								name: name,	title: title,
								calcFunc: calcFunc, table : table,
								kind: kind
						};
						if(axis == "x"){
							//通知graph model添加x轴的这个被拖进来的元素
							self.model.trigger("x:add", addXItem);
						}else{
							//通知graph model添加y轴的这个被拖进来的元素
							self.model.trigger("y:add", addXItem);
						}
					},
					remove: function(event,ui) { //这个事件在sortable中的元素移除自身列表添加到另一个列表时触发.
						var axis = $(this).attr("id") == "x_sortable" ? "x" : "y";
						var axisItem = ui.item.data("axisitem");
						var name = axisItem.name;
						var title = axisItem.title;
						var calcFunc = axisItem.calcfunc;
						var table = axisItem.table;
						var kind = axisItem.kind;
						//这里remove会间接触发一次graph的change事件，上面的receive也会在间接触发一次。两次会冗余
						if(axis == "x"){
							//通知graph model删除x轴的这个被移除的元素
							self.model.trigger("x:remove", axisItem);
						}else{
							//通知graph model删除y轴的这个被移除的元素
							self.model.trigger("y:remove", axisItem);
						}
						
					},
					over: function(event,ui) { //这个事件在一个元素添加到连接列表中时触发.
					},
					out: function(event,ui) { //这个事件在一个元素移除连接列表时触发.
					},
					activate: function(event,ui) { //这个事件发生在使用连接列表,每个连接列表在拖动开始准备接受它时触发.
					},
					deactivate: function(event,ui) { //这个事件发生在排序结束后,传播到所有可能的连接列表.
					}
				}).disableSelection();
			},
			/**
			 * 设置图表类型对应的映射字段可拖放
			 * 
			 */
			setFeatureDroppable: function(){
				var self = this;
				$(".feature").each(function(index){
					var $this = $(this);
					$this.sortable({
						connectWith: ".feature",
						receive: function(event,ui) {
							//字段名
							var column = ui.item.data("filedname");
							//表明
							var table = $(".table-item-choosed").data("table");
							//mapping对应的属性名
							var name = $(this).attr("name");
							self.model.trigger("mapping:add", {
								name: name,
								column: column,
								table: table
							});
						},
						remove: function(event, ui){
							//字段名
							var column = ui.item.data("filedname");
							//表明
							var table = $(".table-item-choosed").data("table");
							//mapping对应的属性名
							var name = $(this).attr("name");
							self.model.trigger("mapping:remove", {
								name: name,
								column: column,
								table: table
							});
						},
						start: function(event, ui){
							$(".feature").css("border-color", "#9FC271");
						},
						stop: function(event, ui){
							$(".feature").css("border-color", "#ddd");
						}
						
					})
				})
			}
		})
		
		//整个Design区域的视图
		DesignRegion.Design = Marionette.LayoutView.extend({
			template: regionDesignTemplate,
			className: "outer-design-content",
			events: {
				"click .graph-view" : "switchGraphTab",
				"click .filter-view" : "switchFilterTab",
				"click .property-view" : "switchPropertyTab"
			},
			regions: {
				designGraphRegion: "#design-graph",
				designFilterRegion: "#design-filter",
				designPropertyRegion: "#design-property"
				
			},
			switchGraphTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "graph");
			},
			switchFilterTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "filter");
			},
			switchPropertyTab: function(e){
				$(".active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "property");
			},
			
		});
		
		
		//编辑x轴对应的模态框view
		DesignRegion.DialogX = Marionette.ItemView.extend({
			className: "modal-dialog",
			template: dialogEditXTemplate,
			onShow: function(){
				var self = this;
				//弹出编辑x模态框后对属性进行改变后，点击保存按钮触发事件
				this.$el.find("#save-setting").click(function(){
					var data = {
							title: $("[name=x_title]").val(),
							calcFunc: $("[name=x_calcFunc]").val(),
							kind: $("[name=x_type]").val(),
							axis: "x"
					}
					//触发axis:change事件，通知axis model更新
					self.model.trigger("axis:change", data);
				})
			},
			/*
			 * 显示前核对要显示的信息
			 */
			onBeforeShow: function(){
				this.$el.find("[name=x_calcFunc]").val(this.model.get("calcFunc"));
				this.$el.find("[name=x_type]").val(this.model.get("kind"));
			}
		});
		
		//编辑y轴对应的模态框view
		DesignRegion.DialogY = Marionette.ItemView.extend({
			className: "modal-dialog",
			template: dialogEditYTemplete,
			onShow: function(){
				var self = this;
				//弹出编辑x模态框后对属性进行改变后，点击保存按钮触发事件
				this.$el.find("#save-setting").click(function(){
					var data = {
							title: $("[name=y_title]").val(),
							calcFunc: $("[name=y_calcFunc]").val(),
							kind: $("[name=y_type]").val(),
							axis: "y"
					}
					//触发axis:change事件，通知axis model更新
					self.model.trigger("axis:change", data);
				})
			},
			/*
			 * 显示前核对要显示的信息
			 */
			onBeforeShow: function(){
				this.$el.find("[name=y_calcFunc]").val(this.model.get("calcFunc"));
				this.$el.find("[name=y_type]").val(this.model.get("kind"));
			}
		})
	})
	return DesignRegionView;
})