define([
'showmsg'
,"backbone"
, "base_sheet"
, 'model/vtron_model'
, "drawer"
], function(Showmsg, Backbone, BaseSheetView, VtronModel, Drawer) {

	var DrawModel 	= VtronModel.extend({
		urlRoot:    "/widget/draw/",

		x:			[],
		y:			[],
		color:		"",
		size:		"",
		shape:		"",

        able_draw:  false,      // 是否可以画图

        assignDrawBasic: function() {
            this.triggerOut("dbbar:restore", this.toJSON());
        },

        getDrawAble:        function() {
            return this.able_draw
        },

        onGetUserAct:           function(data) {
            // 如果属性没有新的变化，不提交
            var noChange = true;
            for (var k in data) {
                if (data[k] !== this.get(k)) {
                    noChange = false;
                    break
                }
            }
            if (noChange)   return;

            this.setToSev(data);
        },

		setToSev: function(data) {
			this.set(data);

			var self = this;
			this.save(null, {
				success: function(m, resp, opt) {
					if (resp.succ) {
                        easy_dialog_close();
                        self.able_draw  = true;
						self.triggerOut("panel:draw_data", resp.data)
					} else {
						easy_dialog_error(resp.msg)						
                        self.able_draw  = false;
						self.triggerOut("panel:clear")
					}
				}, error: function() {
				},
				no_feeding: true
			})
		}

	});


    var WholeModel = VtronModel.extend({
        urlRoot:    function() {
            if(!this.widgetId) {
                return ("/widget/create/")
            } else {
                return ("/widget/edit/" + this.widgetId + "/")
            }
        },
        initialize: function(){
            this.widgetId = $("#page_data").data("id");
        },
        setWidgetId:    function(wiId) {
            this.widgetId = wiId
        }
    });
	

	// 数据中心，分两个部分
	// 其一是图像数据部分，影响图像成像的数据，如 x/shape等等
	// 其二是图像呈现部分，不影响图像本身，只影响图像标注等，如name等等
	// 这里其实根本不是view，只是为了获取View中的属性
	var DataCenter = BaseSheetView.extend({
		initialize: 		function() {
			this.drawModel 	= new DrawModel();
			this.model 	    = new WholeModel();
			this.run()
		},

        setZr:              function(zr) {
            this.zr         = zr
        },

		distribute: 	    function(data) {
            var basicArgs = ["table", "x", "y", "size", "color", "graph"];
            for(var k in data) {
                if(basicArgs.indexOf(k) >= 0) 
                    this.drawModel.set(k, data[k])
                else 
                    // 写回dom处
                    a = 1
            }
            this.drawModel.assignDrawBasic()
		},

		run: 				function() {
			this.onOut(
				"area:user_set_action"
				, _.bind(this.drawModel.onGetUserAct, this.drawModel)
		  	);

			var self = this;
			this.onOut(
				"area:change_table"
				, function(data) {
					self.drawModel.set(data)
				}
			);

            this.onOut(
                "center:page_loaded"
                , function() {
                    // 如果组件存在id，那么前端需要数据恢复现场   
                    if($("#page_data").data("id"))   
                        self.startRestore()
                }
            );

            var self = this;

            // 监听是否需要保存
            VtronEvents.onOut("center:save_args", _.bind(this.onSave, this));

            //监听是否保存并返回
            Backbone.Events.on("center:save_args_and_back", function(){
                self.onSave("back")
            })
		},

        onSave:                 function(succCmd) {
            if (!this.drawModel.getDrawAble()) {
                alert("请做出可视化图形之后再保存");
                return
            }

            this.save(succCmd)
        },

        save:                   function(succCmd) {
            // 抓取命名等参数
            // TBD

            // 合并画图参数
            this.model.set(this.drawModel.toJSON());
            
            var imageBase64 = this.zr.toDataURL("image/png");
            var name = $("#widget_name").val();
            this.model.set({"image":    imageBase64, "name": name});

            // 保存到服务器
            this.model.save(null,{
                success: function(model, response){
                    if ("back" === succCmd) {
                        location = "/widget";
                    } else {
		                $(".show-msg").showmsg({
						 	top: '76px',
						 	left: '43%',
						 	msg: response.msg,
						 	delayTime: 1500
				 		});
                    }
                },error: function(){
                    alert("服务器返回非json数据")
                }
            })
        },

        startRestore:           function() {
            // 拿到需要用去恢复现场的数据
            data = JSON.parse($("#page_data").html());
            this.model.set(data);
            this.distribute(data)
        }
	});

	
	var DrawPanelView = BaseSheetView.extend({
		tagName: 		"div",
		id:				"draw_panel",

        imageOk:        false,        // 是否画出图

		initialize: function() {
			this.onOut("panel:draw_data",   _.bind(this.onGetDrawData, this));
			this.onOut("panel:clear",       _.bind(this.clear, this));
			this.drawer = new Drawer();
            this.dataCenter = new DataCenter()
		},

		onGetDrawData: function(data) {
			this.drawer.run(this.el, data);
            this.dataCenter.setZr(this.drawer.getEc().getZrender())
		},

        clear:      function() {
            this.drawer.stop()
        }
	});

	return DrawPanelView
})



