define([
"backbone"
, "design_menus"
, "work_area"
, "show_area"
, "modal_manager"
], function(Backbone, MenusView, WorkareaView
			, ShowAreaView, ModalManager) {

	// 使model save时，数据是object型
	Backbone.emulateJSON = true;
    
    var MainView = Backbone.View.extend({
        el: "#content",

        initialize: function() {
            this.menusView      = new MenusView();
            this.workareaView   = new WorkareaView();
            this.showAreaView   = new ShowAreaView();

            this.render();
        },

        render: function() {
            this.$el.html("");
            this.$el.append(
                this.menusView.el
                , this.workareaView.el
                , this.showAreaView.el
            );
        }
    });

    return MainView;
});
