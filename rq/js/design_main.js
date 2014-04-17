define([
"backbone"
, "design_menus"
, "work_area"
, "show_area"
, "modal_manager"
, "info_workplace"
], function(Backbone, MenusView, WorkareaView
			, ShowAreaView, ModalManager, InfoWorkplaceView) {

	// 使model save时，数据是object型
	Backbone.emulateJSON = true;
    
    var MainView = Backbone.View.extend({
        el: "#content",

        initialize: function() {
            this.menusView      = new MenusView();
            this.workareaView   = new WorkareaView();
            this.showAreaView   = new ShowAreaView();
            this.infoWorkplaceView = new InfoWorkplaceView();
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
            );
            this.$el.find("#design_panel").append(this.infoWorkplaceView.el);
        },

        showWorktableInfo: function() {
            this.$el.find("#design_panel").append(this.infoWorkplaceView.el);
        },

        showWorkbookInfo: function() {
            this.$el.find("#show_area_panel").append(this.infoWorkplaceView.el);
        }

    });

    return MainView;
});
