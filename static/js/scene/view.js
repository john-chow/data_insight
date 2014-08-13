define(['drawer','gridster'], function(DrawManager, Gridster){
	    //组件类
		var WidgetItem = function(options){
			var obj = {
					urlRoot: "/widget/show/" + options.id + "/",
					fetchPicData: function(){
						var self = this;
			            $.ajax({
			                url:            self.urlRoot
			                , type:         "GET"
			                , success:      self.onGetWidgetData 
			                , error:        function() {}
			                , context:      self
			            })
					},
					onGetWidgetData :  function(data) {
			            // 如果成功，则传递数据到面板进行画图
			            if (data.succ){
			            	this.data = data.data;
			            	this.showNewWidget();
			            } else {
			                alert(data.msg)
			            }
			        },
			        setEl: function($el){
			        	this.$el = $el;
			        },
			        getId : function(){
			        	return this.id;
			        },
			        showNewWidget : function(){
						var drawer = new DrawManager();
		            	drawer.run(this.$el[0], this.data);
					},
					init: function(){
						this.id = options.id;
						this.timestamp = options.stamp;
						this.$el = $(".se_wi_" + this.id + "_" + this.timestamp);
						this.col = options.col;
						this.row = options.row;
						this.sizex = options.sizex;
						this.sizey = options.sizey;
						//gridster布局参数
						this.$el.attr({
							"data-row": this.row, "data-col": this.col,
							"data-sizex": this.sizex, "data-sizey": this.sizey
						});
						this.fetchPicData();
					}
				}
				obj.init();
				return obj;
		}
		
		//场景视图
		var scenceView = {
				$el : $("#scenceView"),
				init: function(){
					//场景类
					this.layout = this.$el.data("layout");
					var self = this;
					$("ul#scenceWidget li").each(function(i){
						var id = $(this).data("id");
						var stamp = $(this).data("stamp");
						var posObj = self.getPos(stamp);
						var widget = new WidgetItem({
							id: id, stamp: stamp,
							col: posObj.col, row: posObj.row,
							sizex: posObj.size_x, sizey: posObj.size_y
						});
						self.widgetList.push(widget);
					});
					
					this.render();
				},
				getPos: function(timestamp){
					var pos = this.layout.filter(function(layout) {
		                			if (layout.data_time == timestamp)   return true;
		            			});
					//转为js对象
					return pos[0];
				},
				widgetList: [],
				render: function(){
					var self = this;
					var widgetList = this.widgetList;
					$.each(widgetList, function(i){
						var widget = widgetList[i];
						var id = widget.getId();
						var stamp = widget.stamp;
						
						//var widgetView = new WidgetView({el: $li, model : widget});
					});
					////////////////等比例缩放,gridster////////////////////
					var rate = 1, 
						width = document.body.clientWidth - 100,
						height = document.body.clientHeight - 100;		
					var image = new Image();
					image.src = this.$el.data("src");
					var sceneWidth = image.width,
	        			sceneHeight = image.height;
	               	 //等比例放大图片
					if(sceneWidth < width && sceneHeight < height){
						rate = width/sceneWidth > height/sceneHeight ? height/sceneHeight : width/sceneWidth;
					}else{//等比例缩小图片
						rate = sceneWidth/width > sceneHeight/height ? width/sceneWidth : height/sceneHeight ;
					}

					var $gridsterEl = this.$el.find(".gridster ul"),
						unitWidth = Math.floor(rate * 50),
						unitHeight = Math.floor(rate * 55);
					var $gridster = $gridsterEl.gridster({
						rate: rate,
				        widget_base_dimensions: [50, 50],           //[57,51]面积大小
				        widget_margins: [1, 1],                       //margin大小
				    }).data('gridster');
					//禁止gridster拖拽
					$gridster.disable();
					////////////////等比例缩放,gridster////////////////////
				},
				getPos: function(timestamp){
					var pos = this.layout.filter(function(layout) {
		                			if (layout.data_time == timestamp)   return true;
		            			});
					//转为js对象
					return pos[0];
				}
		}
		
		var wholeView = {
			init: function(){
				scenceView.init();
			}
		}
		
		wholeView.init();
})