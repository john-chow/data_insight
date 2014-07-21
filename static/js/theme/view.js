
	define(['drawer','gridster'], function(DrawManager, Gridster){
		var GRID_UNIT_WIDTH     = 50,
    		GRID_UNIT_HEIGHT    = 50,
    		$body				= $("body");
		//初始化gridster
		function initGridster($el){
			
				$el.gridster({
	        	//widget_selector: "li",                        //确定哪个元素是widget
		        widget_margins: [1, 1],                       //margin大小
		        widget_base_dimensions: [GRID_UNIT_WIDTH, GRID_UNIT_HEIGHT],           //面积大小
		        helper:'clone',
		       // autogrow_cols: true,
		        draggable: {
		        	start: function(event, ui){
		        		$("#refresh").removeAttr("disabled");
		        	}
		        } ,
		        resize: {
		            enabled: false,
		            start: function(e, ui, $widget) {
		             	
		            },

		            resize: function(e, ui, $widget) {
		                //innerHTML = 'RESIZE offset: ' + ui.pointer.diff_top +' '+ ui.pointer.diff_left + "<br >";
		                //console.log(innerHTML);
		            },

		            stop: function(e, ui, $widget) {
		                innerHTML = '停止事件：' + ui.position.top +' '+ ui.position.left;
		                console.log(innerHTML);
		                $body.trigger("widget_resize_" + $widget.attr("data-id"))
		            }
		          }
		        });
		}

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
		            	drawer.run(this.$el[0], this.data);
					},
					init: function(){
						this.id = options.id;
						this.stamp = options.stamp;
						//this.fetchPicData();
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
		var SenceItem = function(options){
			var obj = {
				setLayout: function(layout){
					this.layout = eval(layout);
				},
				getLayout: function(){
					return this.layout;
				},
				//初始化获取组件列表
				init: function(){
					this.id = options.id;
					this.layout = options.layout;
					var self = this;
					$("ul#scId_" + this.id +" li").each(function(i){
						var id = $(this).data("id");
						var stamp = $(this).data("stamp");
						var widget = new WidgetItem({id: id, stamp: stamp});
						self.widgetList.push(widget);
					});
				},
				widgetList: [],
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
					//this.render();
				},
				render: function(){
					var self = this;
					var gridster = this.$el.find(".gridster ul").gridster().data('gridster');
					//禁止gridster拖拽
					gridster.disable();
					var widgetList = this.model.widgetList;
					$.each(widgetList, function(i){
						var widget = widgetList[i];
						var id = widget.getId();
						var dateTime = widget.stamp;
						var liHtml = "<li class='se_wi_"+id+"_"+ dateTime +
                        "' data-id='"+id+"' data-time='"+ dateTime +
                        "'><div class='se_wi_div se_wi_div_"+
                        id+"'></div></li>";
                        var posObj   = self.getPos(dateTime),
                        	width    = self.$box.width(),
                        	height   = self.$box.height(),
                        	sceneId  = self.model.id,
                        	rate = 1;
                        var image = new Image();
                        image.src = $("#" + sceneId + " img").attr("src");
                        var sceneWidth = image.width,
                    		sceneHeight = image.height;
                        
                        if(sceneWidth > width || sceneHeight > height){
                        	 //等比例压缩图片
                            if(sceneWidth/width > sceneHeight/height){
                            	rate = width/sceneWidth;
                            }else{
                            	rate = height/sceneHeight;
                            }
                            posObj.size_x = posObj.size_x * rate;
                            posObj.size_y = posObj.size_y * rate;
                            posObj.col    = Math.ceil(posObj.col * rate);
                            posObj.row    = Math.ceil(posObj.row * rate);
                        }
			            gridster.add_widget(
			                liHtml
			                , parseInt(posObj.size_x),  parseInt(posObj.size_y)
			                , parseInt(posObj.col),     parseInt(posObj.row)
			            );
                        var $li = $(".se_wi_" + id + "_" + dateTime);
                        widget.setEl($li.children(".se_wi_div_" + id + ":first"));
                        $li.children(".se_wi_div").wrap("<a class='widget-warp' href='/widget/view/" + id + "'></a>");
                        $.when(widget.fetchPicData()).done(function(data){
                        	widget.onGetWidgetData(data);
                        })
						//var widgetView = new WidgetView({el: $li, model : widget});
					})
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
				$("#theme_scences>ul>li").each(function(i){
					var id = $(this).data("id");
					var layout = $(this).data("layout");
					var scence = new SenceItem({id: id,layout: layout});
					self.scenceList.push(scence);
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
				$.each(self.collection, function(i){
					var $figure = $('<figure><div class="gridster"><ul> ' +
						'</ul></div></figure>').appendTo(self.$el);
					initGridster($figure.children(":first").children("ul"));
					var scenceItem = self.collection[i];
					var scenceView = new ScenceView({model: scenceItem,el: $figure});
					if(i == 0){
						//默认选中第一个素略图，现实第一个场景
						scenceView.render();
						scenceView.isRendered = true;
						//监听第一个缩略图单击事件
						$(".scene-list-thumbnail li:nth-child(1)").on("click", function(){
							$("figure").hide();
							$("#box figure:nth-child(1)").show();
						})
					}else{
						i++;
						//监听缩略图的单击事件，触发画场景函数
						$(".scene-list-thumbnail li:nth-child(" + i + ")").on("click", function(){
							$("figure").hide();
							$("#box figure:nth-child(" + i + ")").show();
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