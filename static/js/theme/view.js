
	define(['/static/assets/js/common/tool.js', 'drawer','gridster'], 
            function(_t, DrawManager, Gridster){
		var GRID_UNIT_WIDTH     = 50,
    		GRID_UNIT_HEIGHT    = 50,
    		$body				= $("body");

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
			            	this.data = data.entity;
			            	this.showNewWidget();
			            } else {
			                alert(data.msg)
			            }
			        },
			        getId : function(){
			        	return this.id;
			        },
			        showNewWidget : function(){
						var drawer = new DrawManager(this.$el[0]);
		            	drawer.draw(this.data.figure);
						//var drawer = new drawmanager();
		            	//drawer.run(this.$el[0], this.data);
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
					}
				}
				obj.init();
				return obj;
		}
			
		//组件视图
		/*var WidgetView = function(options){
			var obj = {
				//$el: $("div"),
				showNewWidget : function(){
					var len = $(".se_wi_div_"+this.model.getId()).length;
					//alert(data.widget_id)
					var drawer = new DrawManager();
	            	drawer.run($(".se_wi_div_"+this.model.data.widget_id)[len], this.model.data);
				},
				init : function(){
					this.$el = options.el;
					this.model = options.model;
					console.log(this.model)
					this.showNewWidget();
				}
			}
			
			obj.init();
			return obj;
		}*/
		
		//场景类,包含多个WidgetItem
		var SceneItem = function(options){
			var obj = {
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
				widgetList: [],
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
					this.$el = options.el;
					//场景类
					this.model = options.model;
					this.$box = $("#box");
					var height = document.body.clientHeight - $("#header").outerHeight() - $("#necker").outerHeight() - 70;
					this.$box.outerHeight(height);
					$(".scene-list-thumbnail").outerHeight(height);
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
						width    = self.$box.width(),
						height   = self.$box.height() - 30;				
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

					var $gridsterEl = this.$box.find(".gridster #scId_" + this.model.id),
						unitWidth = Math.floor(rate * 50),
						unitHeight = Math.floor(rate * 55);
					var namespace = "#scene_" + this.model.id;
					console.log(namespace);
					var $gridster = $gridsterEl.gridster({
						namespace: namespace,
						rate: rate,
				        widget_base_dimensions: [50, 50],           //[57,51]面积大小
				        widget_margins: [1, 1], //margin大小
				        avoid_overlapped_widgets: false,
				        extra_cols: 2
				    }).data('gridster');
					//禁止gridster拖拽
					$gridster.disable();
					////////////////等比例缩放,gridster////////////////////
				},
				getPos: function(timestamp){
					var pos = this.model.layout.filter(function(layout) {
		                			if (layout.data_time == timestamp)   return true;
		            			});
					//转为js对象
					return pos[0];
				}

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
				$("#box ul.scene-to-widget").each(function(i){
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
			$el: $("#box"),
			init: function(){
				//初始化主题类
				themeItem.init();
				this.collection = themeItem.scenceList;
				this.render();
			},
			render: function(){
				var self = this;
				$.each(self.collection, function(i, sceneObj){
					var id = sceneObj.id,
						layout = sceneObj.layout,
						src = sceneObj.src;
					var sceneItem = new SceneItem({
							id: id, layout: layout,
							src: src
						})
					var scenceView = new ScenceView({model: sceneItem});
					if(i == 0){
						//默认选中第一个素略图，现实第一个场景
						scenceView.render();
						scenceView.isRendered = true;
						//监听第一个缩略图单击事件
						$(".scene-list-thumbnail li:nth-child(1)").on("click", function(){
							$(".step").hide();
							$("#box .step:nth-child(1)").show();
						})
					}else{
						i++;
						//监听缩略图的单击事件，触发画场景函数
						$(".scene-list-thumbnail li:nth-child(" + i + ")").on("click", function(){
							$(".step").hide();
							$("#box .step:nth-child(" + i + ")").show();
							if(!scenceView.isRendered || scenceView.isRendered == undefined){
								scenceView.render();
							}
							scenceView.isRendered = true;
						})
					}
				});
			},
		}

		//整体视图类
		var wholeView = {
			$el: $("#contianer"),
			init: function(){
				themeView.init();
			}
		}
		//启动所有
		wholeView.init();

		return themeView;
	})
