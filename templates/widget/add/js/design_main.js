define([
"backbone"
, "design_menus"
, "work_area"
, "show_area"
, "info_workplace"
, "modal_manager"
, "base_sheet"
, "model/vtron_model"
, "model/vtron_collection"
, "test"
], function(Backbone, MenusView, WorkareaView
			, ShowAreaView, InfoWorkplaceView, _Modal
			, BaseSheetView, VtronModel, VtronCollection) {

	// 使model save时，数据是object型
	Backbone.emulateJSON = true;
    
    var MainView = Backbone.View.extend({
        el: "#content",

		events: {
		},

        initialize: function() {
			// 先写在这里，以后都是会在info_workplace里面
			this.sheetNumber = 1;
			BaseSheetView.prototype.sheetId 	= this.sheetNumber;
			VtronModel.prototype.sheetId 		= this.sheetNumber;
			VtronCollection.prototype.sheetId 	= this.sheetNumber;


            this.menusView         = new MenusView();
            this.workareaView      = new WorkareaView();
            this.showAreaView      = new ShowAreaView();
            this.infoWorkplaceView = new InfoWorkplaceView();

            Backbone.Events.on(
                "workarea:infowork"
                , _.bind(this.showWorktableInfo, this)
            );
            Backbone.Events.on(
                "showarea:infowork"
                , _.bind(this.showWorkbookInfo, this)
            );

			VtronEvents.onOut(
				"main:add_show_worktable"
                , _.bind(this.showWorktableInfo, this) 
			);
			VtronEvents.onOut(
				"main:add_worktable"
                , _.bind(this.addWorkTable, this) 
			);
			VtronEvents.onOut(
				"main:add_workbook"
                , _.bind(this.addWorkBook, this) 
			);

            this.render();

			// start little test
			t.start()
        },

        render: function() {
            this.$el.html("");

            var $area = $("<div id='area'></div>");
            $area.append(this.workareaView.el, this.showAreaView.el);

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
