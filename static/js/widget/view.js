define([
"backbone"
, 'model/vtron_model'
, "drawer"
], function(Backbone, VtronModel, Drawer) {

	var DrawModel 	= VtronModel.extend({
		urlRoot:            "/widget/draw/",

		x:			        [],
		y:			        [],
		color:		        "",
		size:		        "",
		shape:		        "",

        ifAutoRedraw:       false,        // 是否开自动重画功能
        autoHandle:         null,             
        initialize: function(){
        	_.bind(this.setToSev, this);
        },
		setToSev: function() {
            var self = this;
           /* var data = {};
			//x轴的cmd参数为rgl则表示x轴是普通的，y轴是聚合运算的值
        	if(this.get('x')[0].cmd == 'rgl'){
        		data.y = this.get('y');
        	}else{
        		data.x = this.get('x');
        	}
        	self.set(data);*/
            var requestUpdate = function() {
            	/*data = JSON.parse('{"data":{"y":[{"type":"value"}],"x":[{"data":["广州","北京"],"type":"category"}],"legend_series":[{"series":[1.95,1.92]}]},"type":"bar"} ')
                Backbone.Events.trigger("panel:draw_data", data)*/
                self.save(null, {
                    success: function(m, resp, opt) {

                        if (resp.succ) {
                            //easy_dialog_close();
                            self.able_draw  = true;
                            Backbone.Events.trigger("panel:draw_data", resp.data)
                        } else {
                            //easy_dialog_error(resp.msg)	
                            alert(resp.msg)					
                            self.able_draw  = false;
                            if (self.autoHandle)        clearInterval(self.autoHandle)
                            Backbone.Events.trigger("panel:clear")
                        }
                    }, error: function() {
                    	alert("出错了~")
                    },
                    no_feeding: true
                })
            }

            // 是否需要更新
            if(self.ifAutoRedraw) {
                if (self.autoHandle)        clearInterval(self.autoHandle)
                self.autoHandle = setInterval(requestUpdate, 5000)
            } else {
                requestUpdate();
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
            this.styleModel = new VtronModel();
			this.run();
		},

        setZr:              function(zr) {
            this.zr         = zr
        },

		distribute: 	    function(data) {
            // 绘图参数
            var basicArgs = ["table", "x", "y", "size", "color", "graph"];
            for(var k in data) {
                if(basicArgs.indexOf(k) >= 0) 
                    this.drawModel.set(k, data[k]);
                else 
                    // 写回dom处
                    a = 1;
            }
            //this.drawModel.assignDrawBasic();

            // 样式参数
            /*var styleArgs = [
                "bg", "grid", "title", "legend", "drg", "tb", "tt"
                , "dz", "x", "y", "se"
            ];
            for (var k in data) {
                if(styleArgs.indexOf(k) >= 0)
                    this.styleModel.set(k, data[k]);
            }*/
		},

		run: 				function() {
			this.startRestore();
		},

        startRestore:           function() {
            // 拿到需要用去恢复现场的数据
            data = $("#draw_panel").data("content");
            console.log(JSON.stringify(data))
            this.distribute(data);	
        },

	});

	
	var DrawPanelView = Backbone.View.extend({
		/*tagName: 		    "div",
		id:				    "draw_panel",*/
		el: "#draw_panel",

		initialize:         function() {
			Backbone.Events.on("panel:draw_data",   _.bind(this.onGetDrawData, this));
			Backbone.Events.on("panel:clear",       _.bind(this.clear, this));
			this.drawer = new Drawer();
			this.dataCenter = new DataCenter();
			this.dataCenter.drawModel.setToSev();
			
		},

		onGetDrawData:      function(data) {
            // 合并样式数据
            //var styleData = this.dataCenter.styleModel.toJSON();
            //var data = $.merge(data, {"style": styleData});
            console.log(data)
			this.drawer.run(this.el, data, {
                "yes":          false
                , "url":        "xxx"
                , "period":     2000
            });
            this.dataCenter.setZr(this.drawer.getEc().getZrender());
		},

        clear:              function() {
            this.drawer.stop()
        }

	});

	new DrawPanelView();
})
