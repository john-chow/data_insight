
	define(['drawer','gridster', 'underscore'], function(DrawManager, Gridster, Underscore){
		//组件类
		var WidgetItem = function(options){
			var obj = {
					urlRoot: "/widget/show/" + options.id + "/",
					fetchPicData: function(){
						var defer = $.Deferred();
						var self = this;
			            $.ajax({
			                url:            self.urlRoot
			                , type:         "GET"
			                , success:      function(data){
			                	defer.resolve(data);
			                }
			                , error:        function() {console.log("服务器出错了")}
			                , context:      self
			            });
			            var promise = defer.promise();
			            return promise;
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
		            	drawer.run(this.$el.children(".se_wi_div_" + this.id + ":first")[0], this.data);
					},
					init: function(){
						this.id = options.id;
						this.timestamp = options.timestamp;
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
						//this.fetchPicData();
					}
				}
				obj.init();
				return obj;
		}
			
		
		//场景类,包含多个WidgetItem
		var SceneItem = function(options){
			var obj = {
				widgetList: [],
				//初始化获取组件列表
				init: function(){
					this.id = options.id;
					this.layout = options.layout;
					this.src = options.src;
					var self = this;
					var arrya = new Array();
					$("ul#scId_" + this.id + " li").each(function(i){
						var id = $(this).data("id");
						var stamp = $(this).data("stamp");
						var posObj = self.getPos(stamp);
						var widgetObj = {
							id: id, stamp: stamp,
							col: posObj.col, row: posObj.row,
							sizex: posObj.size_x, sizey: posObj.size_y
						};
						self.widgetList.push(widgetObj);
					})
				},
				sortByRow: function(){
					//获取每个组件在gridster的位置和大小
					var self = this;
					var widgetList = this.widgetList;
					$.each(widgetList, function(i){
						var widget = widgetList[i];
						var timestamp = widget.stamp;
						var posObj   = self.getPos(timestamp);
						 widget.size_x = posObj.size_x;
						 widget.size_y = posObj.size_y;
						 widget.col = posObj.col;
						 widget.row = posObj.row;
					})
					//按组件在gridster的行进行排序
					this.widgetList.sort(function(w1, w2){
						return w1.row > w2.row;
					})
				},
				getPos: function(timestamp){
					var pos = this.layout.filter(function(layout) {
		                			if (layout.data_time == timestamp)   return true;
		            			});
					//转为js对象
					return pos[0];
				},
			}
			obj.init();
			return obj;
		}

		//场景视图
		var ScenceView = function(options){
			var obj = {
				init: function(){
					//场景类
					this.model = options.model;
					this.$el = $("#scene_" + this.model.id);
					this.$ipresenter = $("#ipresenter");
					//this.render();
				},
				render: function(){
					var self = this;
					var widgetList = this.model.widgetList;
					
					$.each(widgetList, function(index, widgetObj){
						var id = widgetObj.id,
							timestamp = widgetObj.stamp,
							col = widgetObj.col,
							row = widgetObj.row,
							sizex = widgetObj.sizex,
							sizey = widgetObj.sizey;
                        //用a标签包裹每个组件，让用户点击每个组件可以查看每个组件的情况
                        //$li.children(".se_wi_div").wrap("<a class='widget-warp' href='/widget/view/" + id + "'></a>");
                        var widget = new WidgetItem({
                        	id : id, timestamp : timestamp,
                        	col: col, row: row,
                        	sizex: sizex, sizey: sizey
                        });
						$.when(widget.fetchPicData()).done(function(data){
                        	widget.onGetWidgetData(data);
                        })
					});
					////////////////等比例缩放,gridster////////////////////
					var rate = 1, 
						width = document.body.clientWidth - 100,
						height = document.body.clientHeight - 100;
					var image = new Image();
					image.src = this.model.src;
					var sceneWidth = image.width,
            			sceneHeight = image.height;
                   	 //等比例放大图片
					if(sceneWidth < width && sceneHeight < height){
						rate = width/sceneWidth > height/sceneHeight ? height/sceneHeight : width/sceneWidth;
					}else{//等比例缩小图片
						rate = sceneWidth/width > sceneHeight/height ? width/sceneWidth : height/sceneHeight ;
					}


					var $gridsterEl = this.$el.find(".gridster #scId_" + this.model.id),
						unitWidth = Math.floor(rate * 50),
						unitHeight = Math.floor(rate * 55);
					var namespace = "#scene_" + this.model.id;
					console.log(namespace);
					var $gridster = $gridsterEl.gridster({
						namespace: namespace,
						rate: rate,
				        widget_base_dimensions: [50, 50],           //[57,51]面积大小
				        widget_margins: [1, 1],                       //margin大小
				        avoid_overlapped_widgets: false
				    }).data('gridster');
					//禁止gridster拖拽
					$gridster.disable();
					////////////////等比例缩放,gridster////////////////////
				},
			}
			obj.init();
			return obj;
		}


		//主题类视图，主题包含多个SenceItem
		var themeItem = {
			scenceList: [],
			//初始化获取场景列表
			init: function(){
				var self = this;
				$("#container ul.scene-to-widget").each(function(i){
					var id = $(this).data("id");
					var layout = $(this).data("layout");
					var src = $(this).data("src");
					var scenceObj = {
						id: id,layout: layout,src: src
					}
					self.scenceList.push(scenceObj);
				})
				
			},
			
		}

		//主题视图
		var themeView = {
			$el: $("#ipresenter"),
			init: function(){
				//初始化主题类
				themeItem.init();
				this.collection = themeItem.scenceList;
				this.render();
			},
			render: function(){
				var self = this;
				$.each(self.collection, function(i, sceneObj){
					//ipresenter插件所需数据data-y赋值
					$("#scene_" + sceneObj.id).data("y", i * window.screen.height);
					var id = sceneObj.id,
						layout = sceneObj.layout,
						src = sceneObj.src;
					var sceneItem = new SceneItem({
							id: id, layout: layout,
							src: src
						})
					var scenceView = new ScenceView({model: sceneItem});
				    scenceView.render();
				    
				});
				

			},
		}

		//整体视图类
		var wholeView = {
				$el: $("#contianer"),
				init: function(){
					themeView.init();
				},
			}
		//启动所有
		wholeView.init();

		return themeView;
	})