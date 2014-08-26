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
			},
			onRender: function(){
				var self = this;
				var whichColumn = this.model.get("whichColumn") + 1;
				//this.$el.find(".myfilter li:nth-child(" + whichColumn +")").addClass("select-filter");
				$(".myfilter li:nth-child(" + whichColumn +")").addClass("select-filter");
				//当字段拖到过滤器的时候触发
				this.$el.find(".myfilter").droppable({
					drop: function(event, ui){
						var axisItem = ui.helper.data("axisitem");
						axisItem.calFunc = axisItem.calFunc == undefined ? "none": axisItem.calFunc;
						//通知model获取fieldName字段的所有值的集合
						self.model.trigger("fetch:field:values", {
								name: axisItem.name, table: axisItem.table,
								kind: axisItem.kind, calcFunc: axisItem.calFunc
							});
						}
				});
				//监听选中过滤器中的值
				this.$el.find(".myfilter-values input[type=checkbox]").click(function(){
					if($(this).prop("checked")){
						//通知model选中过滤器的某个值
						self.model.trigger("filter:select", $(this).val());
						$("<li data-value='" + $(this).val() +"'>[" + $(this).val() +"]</li>").appendTo(self.$el.find(".myfilter-select-or-not"));
					}else{
						//通知model取消选中过滤器的某个值
						self.model.trigger("filter:notselect", $(this).val());
						self.$el.find(".myfilter-select-or-not li:contains('[" + $(this).val() +"]')").remove();
					}
					
				});
				//当操作改变的时候触发
				this.$el.find(".select-or-not").on("change", function(){
					if(self.$el.find(".myfilter-select-or-not li").length > 0){
						//通知model值是选中还是排除
						self.model.trigger("operate:change", $(this).val());
					}
				});
				
				//当清空选中的时候触发
				this.$el.find(".clear-select").on("click", function(){
					if(self.$el.find(".myfilter-select-or-not li").length > 0){
						//通知model清空选中的值
						self.model.trigger("values:clear");
						self.$el.find(".myfilter-select-or-not li").remove();
						self.$el.find(".myfilter-values li input[type=checkbox]").prop("checked", false);
					}
				})
				
				//当点击清空所有的过滤器的时候触发
				this.$el.find(".clear-filters").on("click", function(){
					if(self.$el.find(".myfilter li").length > 0){
						//通知model清空所有的过滤器
						self.model.trigger("filters:clear");
						self.$el.find(".myfilter li").remove();
						self.$el.find(".myfilter-select-or-not li").remove();
						self.$el.find(".myfilter-values li").remove();
					}
				})
				
				//选中某个过滤器时候触发
				this.$el.find(".myfilter>li").on("click", function(){
					var whichFilter = $(this).index();
					if(whichFilter != self.model.get("whichColumn")){
						//通知model选中过滤器
						self.model.trigger("select:filter", whichFilter);
					}
					
				})
				
				//当删除选中过滤器的时候触发
				this.$el.find(".myfilter>li>ul>li.filter-remove").on("click", function(){
					var whichFilter = $(this).parent().parent().index();
					//$(this).parent().remove();
					//通知model删除选中过滤器
					self.model.trigger("filter:remove", whichFilter);
				});
				
				//当选中的过滤器选择了计算类型后出发
				this.$el.find(".myfilter>li>ul>li.filter-calcFunc>ul>li").on("click", function(){
					var whichFilter = $(this).parents(".filter-operate").index();
					var calcFunc = $(this).data("calcfunc");
					var data = {
							whichFilter: whichFilter, calcFunc: calcFunc
					}
					//通知model删除选中过滤器
					self.model.trigger("calcFunc:change", data);
					//矫正显示的计算方式
					self.correctShow(calcFunc, whichFilter);
				})
				
				//监听过滤器是数值变量的时候输入最大最小值的输入
				this.$el.find("#lowRange").on("change", function(){
					var lowRange = $(this).val();
					if(!Number(lowRange)|| !lowRange) {
						$(this).val("");
						return;
					}
					//通知model获取数值变量过滤器的下限
					self.model.trigger("lowRange:add", lowRange);
				})
				this.$el.find("#hightRange").on("change", function(){
					var heightRange = $(this).val();
					if(!heightRange || !Number(heightRange)){
						$(this).val("");
						return;
					}
					var lowRange = self.$el.find("#lowRange").val();
					if(lowRange && Number(heightRange) < Number(lowRange)){
						$(this).val("");
						//alert("最大值不能小于最小值");
						return;
					}
					//通知model获取数值变量过滤器的下限
					self.model.trigger("hightRange:add", heightRange);
				})
				
			},
			/**
			 * 矫正显示的内容，使其与过滤器实际的值相吻合，比如数值变量的过滤器有个计算方式的属性，则显示的计算方式应该与实际的同步
			 * @param calcFunc:选中的计算方式 whichFilter: 选中的过滤器
			 */
			correctShow: function(calcFunc, whichFilter){
				this.$el.find(".filter-calcFunc >ul > li.active").removeClass("active");
				this.$el.find(".filter-calcFunc >ul > li[data-calcfunc=" + calcFunc + "]").get(whichFilter).className = "active";
			}
		})
		
		
		//属性视图
		DesignRegion.Property = Marionette.ItemView.extend({
			template: propertyViewTemplate,
			onShow: function(){
				//显示值
				$("[name=style]").val(this.model.get("style"));
				$("[name=autoRefresh]").val(this.model.get("autoRefresh"));
				$("[name=isPublish]").val(this.model.get("isPublish").toString());
				//name和title一样
				$("[name=title]").val(this.model.get("name"));
				
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
				
				//在x轴或者y轴元素过多的时候会出现纵滚动条，对每个x/y轴元素点击出现下拉框的时候，控制位置
				this.$el.find("#x_sortable > li > b").each(function(){
					$(this).click(function(){
						var left = $(this).offset().left - 90;
						var top = $(this).offset().top + 18;
						$(this).next().css({left: left, top: top})
					})
				})
				this.$el.find("#y_sortable > li > b").each(function(){
					$(this).click(function(){
						var left = $(this).offset().left - 90;
						var top = $(this).offset().top + 18;
						$(this).next().css({left: left, top: top})
					})
				})
				
				
				//监听x轴y轴中某元素点击进行某个计算的时候触发
				this.$el.find("#x_sortable .coordinate-calcfunc > li").on("click", function(){
					if($(this).hasClass("active")){
						return
					}
						
					var calcFunc = $(this).data("calcfunc");
					var data = {
							calcFunc: calcFunc, indexInXY: $(this).parents(".measure").index(),
							whichAxis: "x"
					}
					self.model.trigger("calcFunc:change", data);
				})
				this.$el.find("#y_sortable .coordinate-calcfunc > li").on("click", function(){
					if($(this).hasClass("active")){
						return
					}
					var calcFunc = $(this).data("calcfunc");
					var data = {
							calcFunc: calcFunc, indexInXY: $(this).parents(".mension").index(),
							whichAxis: "y"
					}
					self.model.trigger("calcFunc:change", data);
				})
				
				//监听x轴y轴元素中，点击选择某个类型
				this.$el.find("#x_sortable .coordinate-kind > li").on("click", function(){
					if($(this).hasClass("active")){
						return
					}
					var kind = $(this).data("kind");
					var data = {
							kind: kind, indexInXY: $(this).parents(".measure").index(),
							whichAxis: "x"
					}
					self.model.trigger("kind:change", data);
				})
				this.$el.find("#y_sortable .coordinate-kind > li").on("click", function(){
					if($(this).hasClass("active")){
						return
					}
					var kind = $(this).data("kind");
					var data = {
							kind: kind, indexInXY: $(this).parents(".mension").index(),
							whichAxis: "y"
					}
					self.model.trigger("kind:change", data);
				})
				
				this.correctShow();
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
			/**
			 * 显示视图后校对显示的内容
			 * 
			 */
			correctShow: function(){
				var self = this;
				//校对显示值
				this.$el.find("#x_sortable .coordinate-calcfunc > li.active").removeClass("active");
				this.$el.find("#y_sortable .coordinate-calcfunc > li.active").removeClass("active");
				this.$el.find("#x_sortable .coordinate-kind > li.active").removeClass("active");
				this.$el.find("#y_sortable .coordinate-kind > li.active").removeClass("active");
				$.each(self.model.get("x"), function(i, axis){
					self.$el.find("#x_sortable .coordinate-calcfunc > li[data-calcfunc=" + axis.calcFunc + "]").get(i).className = "active";
					self.$el.find("#x_sortable .coordinate-kind > li[data-kind=" + axis.kind + "]")[i].className  = "active";
					
				})
				
				$.each(self.model.get("y"), function(i, axis){
					self.$el.find("#y_sortable .coordinate-calcfunc > li[data-calcfunc=" + axis.calcFunc + "]")[i].className = "active";
					self.$el.find("#y_sortable .coordinate-kind > li[data-kind=" + axis.kind + "]")[i].className = "active";
				})
				
				this.$el.find(".axis-wapper").outerWidth(this.$el.find(".design-column").outerWidth() - 76);
				
				
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
					receive: function(event,ui) { //这个事件在一个已连接的sortable接收到来自另一个列表的元素时触发.
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
						var table = axisItem.table;
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
				$(".tab .active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "graph");
			},
			switchFilterTab: function(e){
				$(".tab .active").removeClass("active");
				$(e.target).addClass("active");
				this.trigger("show:design:content", "filter");
			},
			switchPropertyTab: function(e){
				$(".tab .active").removeClass("active");
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
							axis: "x"
					}
					//触发axis:change事件，通知axis model更新
					self.model.trigger("axis:change", data);
				})
			},
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
							axis: "y"
					}
					//触发axis:change事件，通知axis model更新
					self.model.trigger("axis:change", data);
				})
			},
		})
	})
	return DesignRegionView;
})