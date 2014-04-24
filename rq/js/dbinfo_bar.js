define([
"backbone"
, "model/dbinfo"
, "bootstrap"
, "text!../template/dbinfo_bar.html" 
], function(Backbone, DbinfoModel, b, dataAreaHtml) {

	var TablesCollection = Backbone.Collection.extend({
		model: 	DbinfoModel, 
		url:	"/indb/content",

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
 
        events: {
        },

		initialize: function() {
			_.bindAll(this, "onTablesFetch", "onTableClicked");

			this.collection = new TablesCollection();
			this.collection.fetch({
				"reset": true
				, success: this.onTablesFetch
			});
		},

		onTablesFetch: function() {
			this.render();
			var self = this;
			
			this.$(".table_name").each( function(idx, ele) {
				var model = self.collection.at(idx);
				//此处有Bug，不能绑定多个
				Backbone.Events.on("dbinfo:model_data", function(title) {
					var data = model.getContentsBykey(title);
					Backbone.Events.trigger("modal:filter_data", data)
				})
				$(ele).on("click", model, self.onTableClicked);
			})
		},

		render: function(ev) {
			if(ev) {
				var modelJson = ev.data.toJSON();
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

		onTableClicked: function(model) {
			this.render(model);
			// 为所有属性增加id
			$.each( this.$(".mension, .measure"), function(i, obj) {
				$(obj).attr("id", "db_property_" + i);
				$(obj).attr("db-data", "db_property_" + i);
			})

            this.$(".mension, .measure").on("dragstart", this.drag);
			this.setDragProperty()
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
		}

    });

    return DbInfoBarView;
})

