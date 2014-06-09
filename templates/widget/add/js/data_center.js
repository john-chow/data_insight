define([
	'backbone'
	, 'model/vtron_model'
	, 'vtron_events'
], function(Backbone, VtronModel, VtronEvents) {

	var DrawModel 	= VtronModel.extend({
		urlRoot: "/widget/draw/",

		x:			[],
		y:			[],
		color:		"",
		size:		"",
		shape:		"",

        assignDrawBasic: function() {
            Backbone.Events.trigger("dbbar:restore", this.toJSON());
        },

		setToSev: function(data) {
            // 如果属性没有新的变化，不提交
            var noChange = true;
            for (var k in data) {
                if (data[k] !== this.get(k)) {
                    noChange = false;
                    break
                }
            }

            if (noChange)   return;

			this.set(data);

			var self = this;
			this.save(null, {
				success: function(m, resp, opt) {
					if (resp.succ) {
						Backbone.Events.trigger("panel:draw_data", resp.data)
					} else {
						easy_dialog_error(resp.msg)						
						// 通知清空
						Backbone.Events.trigger("panel:draw_data", {})
					}
				}, error: function() {
				},
				no_feeding: true
			})
		}

	});


    var WholeModel = VtronModel.extend({
        urlRoot:    function() {
            if("create" === window.action_type) {
                return ("/widget/create/")
            } else {
                return ("/widget/edit/" + window.widget_id + "/")
            }
        }
    });
	

	// 数据中心，分两个部分
	// 其一是图像数据部分，影响图像成像的数据，如 x/shape等等
	// 其二是图像呈现部分，不影响图像本身，只影响图像标注等，如name等等
	// 这里其实根本不是view，只是为了获取View中的属性
	var DataCenter = Backbone.View.extend({
		initialize: 		function() {
			this.drawModel 	= new DrawModel();
			this.model 	    = new WholeModel();
			this.run()
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
			Backbone.Events.on(
				"area:user_set_action"
				, _.bind(this.drawModel.setToSev, this.drawModel)
		  	);

			var self = this;
			Backbone.Events.on(
				"area:change_table"
				, function(data) {
					self.drawModel.set(data)
				}
			);

            Backbone.Events.on(
                "center:page_loaded"
                , function() {
                    // 如果是edit，那么前端需要数据恢复现场
                    if("edit" === window.action_type)   
                        self.startRestore()
                }
            );

            // 监听是否需要保存
            Backbone.Events.on("center:save_args", _.bind(this.saveArgs, this))
		},

        saveArgs:                function() {
            // 抓取命名等参数
            // TBD
            this.model.set(this.drawModel.toJSON());
            this.model.save(null,{success: function(model, respose){
				 alert(respose.msg)
			},error: function(){
				alert("服务器返回非json数据")
			}})
        },

        startRestore:           function() {
            // 拿到需要用去恢复现场的数据
            data = JSON.parse($("#page_data").html());
            this.model.set(data);
            this.distribute(data)
        }
	});

	return DataCenter
})





