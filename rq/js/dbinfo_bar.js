define([
"backbone"
, "bootstrap"
, "text!../template/dbinfo_bar.html" 
], function(Backbone, b, dataAreaHtml) {

    var DbInfoBarView = Backbone.View.extend({

        tagName:    "div",
        id:         "dbinfo_bar",
        template:   dataAreaHtml,

        events: {
        },

        initialize: function() {
            this.listenTo(this.model, "change", this.onDbChanged);

            // 这里应该是model向服务器请求数据
            this.model.simulateData();
        },

        render: function() {
            this.$el.html( _.template(this.template, this.model.toJSON(), {variable: "model"}) );
        },

        onDbChanged: function() {
            this.render();
            this.$(".mension, .measure").on("dragstart", this.drag);
			this.setDragProperty()
        },

        drag: function(ev) {
            //ev.originalEvent.dataTransfer.setData( "text/plain", $(ev.target).html() );
			$tar = $(ev.target);
			data = {
				"pro_id": 		$tar.attr("id")
				, "content": 	$tar.html()
			};

            sessionStorage.dragment = JSON.stringify(data);
        },

		setDragProperty: function() {
			var self = this;
			this.$(".measure, .mension").draggable({
				connectToSortable: "#column_sortable, #row_sortable",
				helper: "clone",
				scroll: "false",
				zIndex: "3000",
				//revert: "invalid",
				cursor: "default",
				helper: function( event ) {
					return $( "<li class='dragging-li ui-state-default'>"+ $(this).html()+"</li>" );
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

