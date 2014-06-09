define([
"backbone"
, "model/vtron_collection"
, "model/vtron_model"
, "vtron_events"
, "bootstrap"
, "gridster"
, "text!../template/info_workplace.html" 
], function(Backbone, VtronCollection, VtronModel, 
			VtronEvents, b, g, infoWorkplaceHtml) {

	var TableModel = VtronModel.extend({}), 
		BookModel  = VtronModel.extend({});

	var TableCollection = VtronCollection.extend({
			model: TableModel
		}),
		BookCollection = VtronCollection.extend({
			model: BookModel
		});


    var infoWorkplaceView = Backbone.View.extend({

        tagName:            "div",
        id:                 "info_workplace",

		sheetNumber:		1,
		dashboardNumber:	1,

        events: {
            "click .work-book"                :"openWorkBook",
            "click .work-table"               :"openWorkTable",
            "dblclick .work-book"             :"changeName",
            "dblclick .work-table"            :"changeName",
			"click .add_work_table"		      :"readyForNewTable"
			, "click .add_work_book"		  :"readyForNewBook"
        },

        initialize: function() {
			this.tableCollection = new TableCollection();
			this.bookCollection = new BookCollection();
            this.render();
            this.gridsterInit();
        },

        render: function() {
            this.$el.html(infoWorkplaceHtml);
        },

        gridsterInit: function() {
             Backbone.Events.once("gridster:init", function(data) {
                 //流动布局
                gridster = $(".gridster ul").gridster({
                  //widget_selector: "li",                        //确定哪个元素是widget
                  widget_margins: [5, 5],                       //margin大小
                  widget_base_dimensions: [140, 140],           //面积大小
                  helper:'clone',
                  autogrow_cols: true,
                  resize:{
                    enabled: true
                  },
                }).data('gridster');
            });
        },

        //函数里面方法还没考虑多个工作簿和工作表
        openWorkBook: function() {
            $("#show_area").show();
            $("#work_area").hide();
            change_auto();
            Backbone.Events.trigger("gridster:init", "");
            Backbone.Events.trigger("showarea:infowork");
            
        },

        openWorkTable: function() {
            $("#show_area").hide();
            $("#work_area").show();
            change_auto();
            Backbone.Events.trigger("workarea:infowork");
        },

        changeName: function(ev) {
            $(ev.target).hide();
            var $input = $(ev.target).siblings("input");
            $input.show().focus();
            $input.blur(function(){
                var $span = $(this).siblings("span");
                var oldName= $span.html();
                var newName= $(this).val();
                if(newName==""){
                  $(this).val(oldName);
                }
                else{
                  $span.html(newName)
                }
                $span.show();
                $(this).hide();
            });
        },

		readyForNewTable: function() {
			VtronEvents.trigger("main:add_worktable", this.sheetNumber);
		},

		readyForNewBook: function() {
			this.dashboardId += 1;
			VtronEvents.trigger("main:add_workbook", this.sheetNumber);
		}

    });

    return infoWorkplaceView;
})
