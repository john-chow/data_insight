define([
"backbone"
, "model/dbinfo"
, "bootstrap"
, "text!../template/dbinfo_bar.html" 
], function(Backbone, DbinfoModel, b, dataAreaHtml) {

	var TablesCollection = Backbone.Collection.extend({
		model: 	DbinfoModel, 
		url:	"/connect/content",

		// 丰富用户的success回调
		fetch:	function(options) {
			var success = options.success;
			var backupThis = this.models;
			options.success = function(collection, resp, options) {
				// 因为backbone源代码里面已经直接用resp给collection赋值了
				// 这里就是撤回上述操作
				collection.reset(backupThis, {"silent": true});
				if(resp.succ) {
					resp = resp.data;
					var method = options.reset ? 'reset' : 'set';
					collection[method](resp, options);
				
					// 调用在使用fetch时，填的success回调函数
					success(collection, resp, options)
				} else {
					alert(resp.msg)
				}
			}

			return Backbone.Collection.prototype.fetch.call(this, options)
		}
	});


    var DbInfoBarView = Backbone.View.extend({

        tagName:    			"div",
        id:         			"dbinfo_bar",
		
		tablesTemplate:			_.template( $(dataAreaHtml).filter("#table_list_wrap").html() ),
		mensionsTemplate: 		_.template( $(dataAreaHtml).filter("#mensions_list_wrap").html() ),
		measuresTemplate:		_.template( $(dataAreaHtml).filter("#measures_list_wrap").html() ),
        timetypeTemplate:       _.template( $(dataAreaHtml).filter("#time_list_wrap").html() ),
 
        events: {
        },

		initialize: function() {
			_.bindAll(this, "onTablesFetch", "onTableClicked");

			this.collection = new TablesCollection();

            this.collection.tables = JSON.parse($("#page_data").html()).tables;
			this.collection.fetch({
				"reset": true
                , data: {tables: JSON.stringify(this.collection.tables)}
				, success: this.onTablesFetch
			});

            Backbone.Events.on("dbbar:restore",  _.bind(this.restoreCenter, this));

            // 显示正在加载标志
            this.showLoading()
		},

		onTablesFetch: function() {
            // 关闭loading
            this.endLoading();

			this.render();
			var self = this;
			
			this.$(".table_name").each( function(idx, ele) {
				var model = self.collection.at(idx);
				Backbone.Events.on("dbinfo:model_data", function(ev) {
					var data = model.getContentsBykey(ev.title);
					ev.callback(data)
				})

				$(ele).on("click", {"model": model}, self.onTableClicked);
			});

			// 默认查看第一表中的列
			this.$(".table_name:first").trigger("click");

            // 通知整个页面正式加载完成
            Backbone.Events.trigger("center:page_loaded");
            Backbone.Events.trigger("center:tables_ok"
                                    , {tables: this.collection.tables})
		},

		render: function(model) {
			if(model) {
				var modelJson = model.toJSON();
				this.$("#mensions_list").html( 
					this.mensionsTemplate(modelJson)
                    + this.timetypeTemplate(modelJson)
				);
				this.$("#measures_list").html( 
					this.measuresTemplate(modelJson)
				)
			} else {
				var namesList = $.map(this.collection.models, function(m) {
					return m.get("name")
				});
				this.$el.html( this.tablesTemplate({"names": namesList}) )
			}
			change_auto();
		},

		onTableClicked: function(ev) {
			var model = ev.data.model;
			this.render(model);
			// 为所有属性增加id
			$.each( this.$(".coordinate"), function(i, obj) {
				$(obj).attr("id", "db_property_" + i);
				$(obj).attr("db-data", "db_property_" + i);
				$(obj).attr("table", model.get("name"))
			})

            this.$(".mension, .measure").on("dragstart", this.drag);
			this.setDragProperty();

			// 记录选中的表明
			model.passTableName()
		},

        drag: function(ev) {console.log("s")
			$tar = $(ev.target);
			data = {
				"pro_id": 		$tar.attr("id")
				, "content": 	$tar.find(".attr").html()
			};

            sessionStorage.dragment = JSON.stringify(data);
        },

		setDragProperty: function() {
			var self = this;
			this.$(".measure, .mension, .timesion").draggable({
				connectToSortable: "#x_sortable, #y_sortable",
				helper: "clone",
				scroll: "false",
				zIndex: "3000",
				//revert: "invalid",
				cursor: "default",
				helper: function( event ) {
					return $( "<li class='dragging-li-measure ui-state-default'>"+ $(this).html()+"</li>" );
				},
				//所有的回调函数(start, stop, drag)接受两个参数: 浏览器事件和ui对象
				start: function(event,ui) {
					$(".dragging-custom").addClass("dragging-change-border");
				},
				drag: function(event,ui) {
				},
				stop: function(event,ui) {
					$(".dragging-custom").removeClass("dragging-change-border");
				}
			});

            /*
			this.$(".mension").draggable({
				connectToSortable: "#x_sortable, #y_sortable",
				helper: "clone",
				scroll: "false",
				zIndex: "3000",
				//revert: "invalid",
				cursor: "default",
				helper: function( event ) {
					return $( "<li class='dragging-li-mension ui-state-default'>"+ $(this).html()+"</li>" );
				},
				//所有的回调函数(start, stop, drag)接受两个参数: 浏览器事件和ui对象
				start: function(event,ui) {
					$(".dragging-custom").addClass("dragging-change-border");
				},
				drag: function(event,ui) {
				},
				stop: function(event,ui) {
					$(".dragging-custom").removeClass("dragging-change-border");
				}
			});
            */
		},

        restoreCenter:                function(posAttrObj) {
            var itemListObj = this.$(".measure, .mension");
            for (var type in posAttrObj) {
                if ("x" === type || "y" === type) {
                    var restoreList = [];
                    for (var idx in posAttrObj[type]) {
                        var attrObj = posAttrObj[type][idx];
                        var restoreItem = itemListObj.filter( function(i) {
                            return attrObj["attr"] === $(itemListObj[i]).find(".attr").html() 
                        }).clone()[0];
                        restoreList.push( $.extend({}, attrObj, {"item": restoreItem}) )
                    }

                    if("x" === type) {
                        Backbone.Events.trigger("axis:restore_x", restoreList);
                    } else {
                        Backbone.Events.trigger("axis:restore_y", restoreList);
                    }
                }
                else if("color" === type || "size" === type) {
                    var attr_obj = posAttrObj[type];
                    if (!attr_obj)      return

                    var restoreItem = itemListObj.filter( function(i) {
                        return attr_obj["column"] === $(itemListObj[i]).find(".attr").html() 
                    }).clone()[0];

                    var restoreData = {"item": restoreItem, "kind": type};
                    Backbone.Events.trigger("box:restore_color_size", restoreData);
                }
                else if("graph" === type) {
                    var attr = posAttrObj[type];
                    Backbone.Events.trigger("display:restore_graph", attr)
                }
            }
        },

        showLoading:                function() {
            this.$el.append("<img class='loading' src='/static/images/loading.gif'>")
        },

        endLoading:                 function() {
            this.$(".loading").remove()
        }
    });

    return DbInfoBarView;
})

