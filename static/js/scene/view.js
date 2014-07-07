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
		
		//场景视图
		var scenceView = {
				$el : $("#scenceView"),
				init: function(){
					//场景类
					var self = this;
					initGridster($(".gridster ul"));
					$("ul#scenceWidget li").each(function(i){
						var id = $(this).data("id");
						var stamp = $(this).data("stamp");
						var widget = new WidgetItem({id: id, stamp: stamp});
						self.widgetList.push(widget);
					});
					this.layout = eval(this.$el.data("layout"));
					this.render();
				},
				widgetList: [],
				render: function(){
					var self = this;
					var gridster = this.$el.find(".gridster ul").gridster().data('gridster');
					var widgetList = this.widgetList;
					$.each(widgetList, function(i){
						var widget = widgetList[i];
						var id = widget.getId();
						var stamp = widget.stamp;
						//div.se_wi_div一定要设置高度为100%，不然echart画不出来
						var liHtml = "<li class='se_wi_"+id+"_"+ stamp +
                        "' data-id='"+ id +
                        "'><div class='se_wi_div se_wi_div_"+
                        id+"'></div></li>";
                        var posObj = self.getPos(stamp);
			            gridster.add_widget(
			                liHtml
			                , parseInt(posObj.size_x),  parseInt(posObj.size_y)
			                , parseInt(posObj.col),     parseInt(posObj.row)
			            );
                        var $li = $(".se_wi_" + id + "_" + stamp);
                        widget.setEl($li.children(":first"));
						//var widgetView = new WidgetView({el: $li, model : widget});
					})
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
			$el : $("#scenceView"),
			init: function(){
				scenceView.init();
			},
		}
		
		wholeView.init();
})