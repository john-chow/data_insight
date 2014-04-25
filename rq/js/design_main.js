define([
"backbone"
, "design_menus"
, "work_area"
, "show_area"
, "info_workplace"
, "error_message"
, "base_sheet"
], function(Backbone, MenusView, WorkareaView
			, ShowAreaView, InfoWorkplaceView
			, MessageView, BaseSheetView) {

	// 使model save时，数据是object型
	Backbone.emulateJSON = true;
    
    var MainView = Backbone.View.extend({
        el: "#content",

		sheetNumber:		1,
		dashboardNumber:	1,

		events: {
			"click .add_work_table":	"addWorkTable"
			, "click .add_work_book":	"addWorkBook"
		},

        initialize: function() {
			this.addWorkTable();
            this.menusView         = new MenusView();
            this.workareaView      = new WorkareaView();
            this.showAreaView      = new ShowAreaView();
            this.infoWorkplaceView = new InfoWorkplaceView();
            this.messageView       = new MessageView();
            Backbone.Events.on(
                "workarea:infowork"
                , _.bind(this.showWorktableInfo, this)
            );
            Backbone.Events.on(
                "showarea:infowork"
                , _.bind(this.showWorkbookInfo, this)
            );

            this.render();
        },

        render: function() {
            this.$el.html("");
            this.$el.append(
                this.menusView.el
                , this.workareaView.el
                , this.showAreaView.el
                , this.messageView.el
            );
            this.$el.find("#design_panel").append(this.infoWorkplaceView.el);
        },

        showWorktableInfo: function() {
            this.$el.find("#design_panel").append(this.infoWorkplaceView.el);
        },

        showWorkbookInfo: function() {
            this.$el.find("#show_area_panel").append(this.infoWorkplaceView.el);
        },

		addWorkTable: function() {
			this.sheetNumber += 1;
			BaseSheetView.prototype.sheetId = this.sheetNumber;
		},

		addWorkBook: function() {
		}

    });

    return MainView;
});
