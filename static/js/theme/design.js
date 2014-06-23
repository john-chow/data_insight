(function($){
		//场景模板
        var SceneModel = function(){
        	var obj = {
        		init: function(){
        		this.id = 0;
        		this.order = 0;
	        	},
	        	setId: function(id){
	        		this.id = id;
	        	},
	        	getId: function(){
	        		return this.id;
	        	},
	        	setOrder: function(order){
	        		this.order = order;
	        	},
	        	setSerial: function(serial){
	        		this.serial = serial;
	        	},
	        	getSerial: function(){
	        		return this.serial;
	        	}
        	}
        	
        	return obj;
        }
        
        //场景集合，即主题
        var scenceCollection = {
        	init: function(){
        		this.models = new Array();//场景id数组
        		this.m_name = $("#theme_id").val();
        		this.m_switch_effect = $("#playStyle").text();
        		this.id = 0;
        		if($(".theme-scence-count").data("id")){
        			this.url = "/theme/edit/" + $(".theme-scence-count").data("id")
        						+ "/";
        		}
        	},
        	refresh: function(){
        		this.m_name = $("#theme_id").val();
        		this.m_switch_effect = $("#playStyle").text();
        		var self = this;
        		//保存前控制好播放顺序
        		$("#play_order li").each(function(i){
        			var serial = $(this).data("orderid");
        			$.each(self.models, function(index){
        				if(self.models[index].getSerial() == serial){
        					self.models[index].setOrder(i);
        				}
        			})
        		})
        	},
        	url: "/theme/create/",
        	add: function(model){
        		this.models.push(model);
        	},
        	remove: function(model){
        		for(var i = 0; i < this.models.length; i++){
        			var m = this.models[i];
        			if(m.getSerial() === model.getSerial()){
        				this.models.remove(m);
        			}
        		}	
        	},
        	save: function(options){
        		this.refresh();
        		//drawthemeViews.$el
        		var self = this;
        		if(this.id){
        			this.url = "/theme/edit/" + this.id + "/";
        		}
    			$.ajax({
        			url: this.url,
        			type: "post",
        			data: {
        				name: this.m_name,
        				switch_effect: this.m_switch_effect,
        				scences: JSON.stringify(this.models)
        			},
        			success: function(data){
        				self.id = data.id;
        				options.success(data);
        			},
        			error: function(data){
        				options.error(data);
        			}
        		});
	        		
        	  
        		
        	}
        }

        //场景列表视图
        var scenceViews = {
        	init: function(){
        		this.$el.children("li").draggable({
					connectToSortable: "#draw_theme",
					scroll: "false",
					helper: function( event ) {
								return $( "<div class='theme-draggable'>"+ $(this).html()+"</div>" );
							},
					start: function(event,ui) {
						$(".slider-viewport").css("border", "2px solid #666");
					},
					stop: function(event,ui) {
						$(".slider-viewport").css("border", "0");
					}
				});
        	},
        	$el: $("#theme_list")
        };

		//播放顺序列表项视图
		var playorderView = {
			render: function(){
				return $("<li id='" + this.scenceId + "' data-orderid='" + this.serial + 
					"'><img width= '30' height='30' src='"+ this.imgSrc +"'/>"
				 + this.scenceName + "<a class='scene-remove' data-id='" + this.scenceId + "'data-serial = '"
				 + this.serial+"'>"
				 + "&times;</a></li>").prependTo(this.parent.$el);
			},
			init: function(parent, scenceId, serial, scenceName, imgSrc){
			  this.parent = parent;
			  this.scenceName = scenceName;
			  this.scenceId = scenceId;
			  this.serial = serial;
			  this.imgSrc = imgSrc;
			  this.$el = this.render();
			  //顺序播放列表现的各种事件监听，比如删除列表项之类的
		      this.$el.on("mouseover", function(){
			       		$(this).children(".scene-remove").show();
			       });
		       this.$el.on("mouseleave", function(){
		       		$(this).children(".scene-remove").hide();
		       });
		       var $self = this;
		       this.$el.children("li .scene-remove").on("click", function(){
		        	var sId = $(this).data("id");
		        	var serial = $(this).data("serial");
		        	var sceneModel = new SceneModel();
		        	sceneModel.setId(sId);
		        	sceneModel.setSerial(serial);
		        	scenceCollection.remove(sceneModel);//删除场景
		        	$("#s_" + serial).remove();
		       		$(this).parent().remove();
		       		var count = $("#scenceCount").data("count") - 1;
		            $("#scenceCount").html(count);
		            $("#scenceCount").data("count", count);
		            if(count <= 1){
		            	$("#save_scene").attr("disabled","disabled");
		            	$("#pause").attr("disabled","disabled");
		            	$("#stop").click();
		            	$("#stop").attr("disabled","disabled");
		            	$("#play").attr("disabled","disabled");
		            }
		       });
			}
		}
        //播放顺序列表视图
        var playorderViews = {
        	init: function(){
        		var fromIdex, toIndex;
        		 //播放顺序拉拽
			    this.$el.sortable({
			    	start : function(event, ui){
			    		fromIdex = ui.item.index();
			    	},
			    	stop : function( event, ui ) {
						var sId = ui.item.data("orderid"),
					 		toIndex = ui.item.index(),
					 		$selectObj = $("#s_" + sId);
						if(toIndex == $("#draw_theme .slide").last().index()){
							$selectObj.appendTo($("#draw_theme"));
						}else if(toIndex == 0){
							$selectObj.prependTo($("#draw_theme"));
						}else{
							$selectObj.insertAfter("#draw_theme .slide:eq(" + (toIndex - 1) + ")");
						}
					}
			    });
			    //如果是编辑主题的时候，则根据该主题拥有的场景初始化播放吮吸
			    $("#draw_theme .slide").each(function(i){
			    	var $this = $(this);
			    	var scenceId = $this.data("id"),
			    		serial = new Date().getTime(),
			    		scenceName = $this.data("name"),
			    		imgSrc = $this.data("src");
			    	var sceneModel = new SceneModel();
					sceneModel.setId(scenceId);
					sceneModel.setSerial(serial);
					scenceCollection.add(sceneModel);//添加主题场景id
			    	playorderView.init(playorderViews,scenceId,serial,scenceName,imgSrc);
			    });
        	},
        	$el: $("#play_order"),
        	events: {

        	}
        }

        //中心区域，即场景播放动画区域场景列表视图
        var drawthemeViews = {
	        	init: function(){
	        		
	        		var $self = this;
	        		this.$el.droppable({
						drop: function( event, ui ) {
							var imgSrc = ui.helper.find("img").attr("src");
							var scenceId = ui.helper.find("img").data("id");
							var serial = new Date().getTime();
							var sceneModel = new SceneModel();
							sceneModel.setId(scenceId);
							sceneModel.setSerial(serial);
							scenceCollection.add(sceneModel);//添加主题场景id
							var scenceName = ui.helper.find("img").data("name");
							//初始化中心区域场景列表现,并渲染
							drawthemeView.init($self, serial, scenceName, imgSrc);
							drawthemeView.render();
							//始化播放顺序列表项,初始化过程中会自动渲染
							//playorderViews.init();
							playorderView.init(playorderViews,scenceId,serial,scenceName,imgSrc);
							
				            var count = $("#scenceCount").data("count") + 1;
				            $("#scenceCount").html(count);
				            $("#scenceCount").data("count", count);
				            //如果添加上去的场景多于1个的时候，则可以进行播放和保存
				            if(count > 1 && !$('#time-indicator').is(":animated")){
				            	$("#play").removeAttr("disabled");
				            	$("#save_scene").removeAttr("disabled");
				            }
						}
					})
				},
				$el : $( "#draw_theme" )
        };

		//中心区域场景列表项
        var drawthemeView = {
        	init: function(parent, serial, scenceName,imgSrc){
        		this.$parent = parent.$el;
        		this.serial = serial;
        		this.scenceName = scenceName;
        		this.imgSrc = imgSrc;
        	},
        	render:function(){
        		$("<figure class='slide' id='s_" + this.serial + "'><h5 class='scence-title'>" + this.scenceName +"</h5><img src='" + this.imgSrc + "'></figure>").prependTo(this.$parent);
        	}
        }
        
   		//初始化
   		scenceCollection.init();
        scenceViews.init();
        playorderViews.init();
        drawthemeViews.init();
        //保存场景集合到服务器
        $("#save_scene").click(function(){
        	scenceCollection.save({success: function(data){
        		$(".show-msg").showmsg({
				 	top: '55px',
				 	left: '37%',
				 	msg: data.msg,
				 	delayTime: 1500
				 });
	         }, error: function(data){
	        }});
        })
        

})(jQuery)