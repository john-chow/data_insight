define([
"backbone"
, "design_menus"
, "work_area"
, "show_area"
, "submit_form"
, "modal_manager"
], function(Backbone, MenusView, WorkareaView
			, ShowAreaView, submitFormView, ModalManager) {

	// 使model save时，数据是object型
	Backbone.emulateJSON = true;
    
    var MainView = Backbone.View.extend({
        el: "#content",

        initialize: function() {
            this.menusView      = new MenusView();
            this.workareaView   = new WorkareaView();
            this.showAreaView   = new ShowAreaView();
            this.submitFormView = new submitFormView();

            this.render();
        },

        render: function() {
            this.$el.html("");
            this.$el.append(
                this.menusView.el
                , this.workareaView.el
                , this.showAreaView.el
                , this.submitFormView.el
            );
        }
    });

    return MainView;
});
