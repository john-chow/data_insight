define([
"backbone"
, "design_menus"
, "work_area"
, "info_workplace"
,"toolbar"
], function(Backbone, MenusView, WorkareaView
			, InfoWorkplaceView, Toolbar) {

	// 使model save时，数据是object型
	Backbone.emulateJSON = true;
    
    var MainView = Backbone.View.extend({
        el: "#content",

		events: {
		},

        initialize: function() {
            this.menusView         = new MenusView();
            this.workareaView      = new WorkareaView();
            this.infoWorkplaceView = new InfoWorkplaceView();

            Backbone.Events.on(
                "workarea:infowork"
                , _.bind(this.showWorktableInfo, this)
            );
            Backbone.Events.on(
                "showarea:infowork"
                , _.bind(this.showWorkbookInfo, this)
            );

			Backbone.Events.on(
				"main:add_show_worktable"
                , _.bind(this.showWorktableInfo, this) 
			);
			Backbone.Events.on(
				"main:add_worktable"
                , _.bind(this.addWorkTable, this) 
			);
			Backbone.Events.on(
				"main:add_workbook"
                , _.bind(this.addWorkBook, this) 
			);

            this.render();

			// start little test
			//t.start()
        },

        render: function() {
            this.$el.html("");

            var $area = $("<div id='area'></div>");
            $area.append(this.workareaView.el);

            this.$el.append(
                this.menusView.el
                , $area
                , this.infoWorkplaceView.el
            );
/*            this.$el.find("#design_panel").append(this.infoWorkplaceView.el);*/
        },

        showWorktableInfo: function() {
			// 要先根据sheetId查找，有就show，没有就new+append
            //this.$el.find("#design_panel").append(this.infoWorkplaceView.el);
        },

        showWorkbookInfo: function() {
            //this.$el.find("#show_area_panel").append(this.infoWorkplaceView.el);
        },

		addWorkBook: function() {
		},

		addWorkTable: function() {
		}

    });

    return MainView;
});
