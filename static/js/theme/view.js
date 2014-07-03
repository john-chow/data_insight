
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
						this.stamp = options.stamp;
						this.fetchPicData();
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
					this.render();
				},
				render: function(){
					var self = this;
					var gridster = this.$el.find(".gridster ul").gridster().data('gridster');
					var widgetList = this.model.widgetList;
					$.each(widgetList, function(i){
						var widget = widgetList[i];
						var id = widget.getId();
						var dateTime = widget.stamp;
						var liHtml = "<li class='se_wi_"+id+"_"+ dateTime +
                        "' data-id='"+id+"' data-time='"+ dateTime +
                        "'><div class='se_wi_div se_wi_div_"+
                        id+"'></div></li>";
                        console.log(liHtml)
                        var posObj = self.getPos(dateTime);
			            gridster.add_widget(
			                liHtml
			                , parseInt(posObj.size_x),  parseInt(posObj.size_y)
			                , parseInt(posObj.col),     parseInt(posObj.row)
			            );
                        var $li = $(".se_wi_" + id + "_" + dateTime);
                        widget.setEl($li.children(":first"));
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

				})

			},
			//播放
			play: function(){
				var $box = this.$el;
				var fx = $box.data("fx");
				$box.boxSlider({
			        speed: 1000
			      , autoScroll: true
			      , timeout: 1000
			      , effect: fx
				});
					},
		}

		//整体视图类
		var wholeView = {
			$el: $("#contianer"),
			init: function(){
				themeView.init();
				this.slideInterval = 5000;
				this.$timeIndicator = $("#time-indicator");
				this.$box = themeView.$el;
				this.$currentPlay = $("figure:first");
				this.events();
			},
			switchIndicator: function($c, $n, currIndex, nextIndex){
				this.$timeIndicator.stop().css('width', 0);
			},
			startTimeIndicator : function(){
				var self = this;
				var $box = this.$box;
				var leftTime = this.slideInterval;
	        	if(this.$timeIndicator.width() > 0){
	        		leftTime = ($("#contianer").width() - 
	        			this.$timeIndicator.width()) / $("#contianer").width() * this.slideInterval;
	        	}
	          	this.$timeIndicator.animate({width: '100%'}, leftTime, function(){
	          		if(self.$box.data("fx")){
	          			//$("#next").click();
	          		}
	          	});
	          	//alert($box.boxSlider('showSlide'))
			},
			pauseTimeIndicator: function(){
				this.$timeIndicator.stop();
			},
			stopTimeIndicator : function(){
				$timeIndicator.stop().css('width', 0);
			},
			events: function(){
				var self = this;
				var $box = this.$box;
				$("#play").click(function(){
		        	$(this).attr("disabled", "disabled");
		        	$("#pause").removeAttr("disabled");
		        	$("#stop").removeAttr("disabled");
		        	$("#next").removeAttr("disabled");
		        	$("#prev").removeAttr("disabled");
			    	var fx = $box.data("fx");
		    		if(!$(this).hasClass("played")){
		    			self.$box.boxSlider({
				            speed: 1000
				          , autoScroll: true
				          , timeout: self.slideInterval
				          , next: '#next'
				          , prev: '#prev'
				          //, pause: '#pause'
				          , effect: fx
				          , blindCount: 15
				          , onbefore: bindContext(self.switchIndicator, self)
				          , onafter: bindContext(self.startTimeIndicator, self)
				        });
				         $(this).addClass("played");
				         $box.boxSlider('option', 'onafter', function ($previousSlide, $currentSlide, currIndex, nextIndex) {
  							// 'this' is effectively $('#content-box')
  							self.startTimeIndicator();
  							self.$currentPlay = $currentSlide;
						 });
		    		}
			    	self.startTimeIndicator();
		    	});
		    	$("#pause").on("click", function(){
		        	$("#play").removeAttr("disabled");
		        	$("#pause").attr("disabled", "disabled");
		        	self.pauseTimeIndicator();
		        	self.$box.boxSlider('playPause');
	        	});
	        	$("#prev,#next").on("click", function(){
		        	$("#pause").removeAttr("disabled");
		        	$("#play").attr("disabled", "disabled");
	        	});
	        
		        $("#stop").click(function(){
		        	$box.boxSlider('destroy');
		        	$box.data("fx", "");
		        	stopTimeIndicator();
		        	$("#play").removeAttr("disabled");
		        	$(this).attr("disabled","disabled");
		        	$("#next").attr("disabled","disabled");
		        	$("#prev").attr("disabled","disabled");
		        	$("#pause").attr("disabled","disabled");
		        });

		        $("#refresh").click(function(){
		        	$(this).attr("disabled");
		        	var gridster = self.$currentPlay.find(".gridster ul").gridster().data('gridster');
		        	var widgets = gridster.$widgets;
		        	$.each(widgets, function(index){
		        		var id = $(widgets[index]).data("id");
		        		var liHtml = "<li class='se_wi_"+id+"_"+ 
                        "' data-id='"+id+"' data-time='"+
                        "'><div class='se_wi_div se_wi_div_"+
                        id+"'>" +  $(widgets[index]).html() + "</div></li>";
                        var layoutObj = themeView.collection[self.$currentPlay.index()].getLayout();
                        var timestamp = $(widgets[index]).data("time");
                        var pos = layoutObj.filter(function(layout) {
		                			if (layout.data_time == timestamp)   return true;
		            			});
						//转为js对象
						var posObj = pos[0];
		        		/*gridster.resize_widget(
		        			$(widgets[index])
		        			, parseInt(posObj.size_x),  parseInt(posObj.size_y)
			                , true);*/
		        		//恢复表格的位置和大小
		        		$(widgets[index]).attr("data-row", posObj.row);
		        		$(widgets[index]).attr("data-col", posObj.col);
		        		$(widgets[index]).attr("data-sizex", posObj.size_x);
		        		$(widgets[index]).attr("data-sizey", posObj.size_y);
		        	})
		        	/*gridster.add_widget(
			                
			                , parseInt(posObj.size_x),  parseInt(posObj.size_y)
			                , parseInt(posObj.col),     parseInt(posObj.row)
			            );*/
		        })
			},
		}
		//启动所有
		wholeView.init();

		return themeView;
	})