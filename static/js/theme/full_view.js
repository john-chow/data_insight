
	define(['drawer','gridster'], function(DrawManager, Gridster){
		var GRID_UNIT_WIDTH     = 50,
    		GRID_UNIT_HEIGHT    = 55,
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
		            enabled: true,
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
					this.src = options.src;
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
					this.$ipresenter = $("#ipresenter");
					this.render();
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
                        var posObj   = self.getPos(dateTime);
			            gridster.add_widget(
			                liHtml
			                , parseInt(posObj.size_x),  parseInt(posObj.size_y)
			                , parseInt(posObj.col),     parseInt(posObj.row)
			            );
                        var $li = $(".se_wi_" + id + "_" + dateTime);
                        widget.setEl($li.children(".se_wi_div:first"));
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
					var src = $(this).data("src");
					var scence = new SenceItem({id: id,layout: layout,src: src});
					self.scenceList.push(scence);
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
				$.each(self.collection, function(i){
					var $scene = $('<div class="step" data-x="0" data-y="' + 1500*i +'"><div class="gridster"><ul> ' +
						'</ul></div></div>').appendTo(self.$el);
					initGridster($scene.children(":first").children("ul"));
					var scenceItem = self.collection[i];
					var scenceView = new ScenceView({model: scenceItem,el: $scene});
					
				});
				

			},
		}

		//整体视图类
		var wholeView = {
				$el: $("#contianer"),
				init: function(){
					themeView.init();
					//this.fullScreen();
				},
			}
		//启动所有
		wholeView.init();

		return themeView;
	})