define([
"jquery"
, "backbone"
, "design_menus"
, "work_area"
], function($, Backbone, MenusView, WorkareaView) {

	Backbone.emulateJSON = true;
    
    var MainView = Backbone.View.extend({
        el: "#content",

        initialize: function() {
            this.menusView      = new MenusView();
            this.workareaView   = new WorkareaView();

            this.render();
        },

        render: function() {
            this.$el.html("");
            this.$el.append(
                this.menusView.el
                , this.workareaView.el
            );
        }
    });

    return MainView;
});
