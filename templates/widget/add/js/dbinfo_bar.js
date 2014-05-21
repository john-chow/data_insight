define([
"backbone"
, "base_sheet"
, "model/dbinfo"
, "bootstrap"
, "vtron_events"
, "text!../template/dbinfo_bar.html" 
], function(Backbone, BaseSheetView, DbinfoModel, b, VtronEvents, dataAreaHtml) {

	var TablesCollection = Backbone.Collection.extend({
		model: 	DbinfoModel, 
		url:	"/widget/content",

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


    var DbInfoBarView = BaseSheetView.extend({

        tagName:    			"div",
        id:         			"dbinfo_bar",
		
		tablesTemplate:			_.template( $(dataAreaHtml).filter("#table_list_wrap").html() ),
		mensionsTemplate: 		_.template( $(dataAreaHtml).filter("#mensions_list_wrap").html() ),
		measuresTemplate:		_.template( $(dataAreaHtml).filter("#measures_list_wrap").html() ),
 
        events: {
        },

		initialize: function() {
			_.bindAll(this, "onTablesFetch", "onTableClicked");

			this.collection = new TablesCollection();
			this.collection.fetch({
				"reset": true
				, success: this.onTablesFetch
			});

            this.onOut("dbbar:restore",  _.bind(this.helpAxisRestore, this));
		},

		onTablesFetch: function() {
			this.render();
			var self = this;
			
			this.$(".table_name").each( function(idx, ele) {
				var model = self.collection.at(idx);
				self.onOut("dbinfo:model_data", function(ev) {
					var data = model.getContentsBykey(ev.title);
					ev.callback(data)
				})

				$(ele).on("click", {"model": model}, self.onTableClicked);
			});

			// 默认查看第一表中的列
			this.$(".table_name:first").trigger("click");

            // 通知整个页面正式加载完成
            this.triggerOut("center:page_loaded")
		},

		render: function(model) {
			if(model) {
				var modelJson = model.toJSON();
				this.$("#mensions_list").html( 
					this.mensionsTemplate(modelJson)
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
			$.each( this.$(".mension, .measure"), function(i, obj) {
				$(obj).attr("id", "db_property_" + i);
				$(obj).attr("db-data", "db_property_" + i);
			})

            this.$(".mension, .measure").on("dragstart", this.drag);
			this.setDragProperty();

			// 记录选中的表明
			model.passTableName()
		},

        drag: function(ev) {
			$tar = $(ev.target);
			data = {
				"pro_id": 		$tar.attr("id")
				, "content": 	$tar.find(".attr").html()
			};

            sessionStorage.dragment = JSON.stringify(data);
        },

		setDragProperty: function() {
			var self = this;
			this.$(".measure").draggable({
				connectToSortable: "#column_sortable, #row_sortable",
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
			this.$(".mension").draggable({
				connectToSortable: "#column_sortable, #row_sortable",
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
		},

        helpAxisRestore:                function(posAttrObj) {
            for (var pos in posAttrObj) {
                var restoreList = [];
                for (var idx in posAttrObj[pos]) {
                    var attrObj = posAttrObj[pos][idx];
                    var itemListObj = this.$(".measure, .mension");
                    var restoreItem = itemListObj.filter( function(i) {
                        return attrObj["attr"] === $(itemListObj[i]).find(".attr").html() 
                    })[0];
                    restoreList.push( $.extend({}, attrObj, {"item": restoreItem}) )
                }
                switch(pos)     {
                    case "x":    this.triggerOut("column:restore_action", restoreList);     break
                    case "y":    this.triggerOut("row:restore_action", restoreList);        break     
                }
            }
        }

    });

    return DbInfoBarView;
})

