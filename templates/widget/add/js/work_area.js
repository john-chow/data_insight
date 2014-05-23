define([
"backbone"
, "base_sheet"
, "dbinfo_bar"
, "design_panel"
], function(Backbone,BaseSheetView, DbBarView, PanelView
			) {

    var WorkAreaView = BaseSheetView.extend({

        tagName: 	"div",
        id: 		"work_area",

        initialize: function() {

            this.dbBarView  = new DbBarView();
            this.panelView  = new PanelView();
            this.render();
        },

        render: function() {
            this.$el.append(
                this.dbBarView.el, this.panelView.el
            );
        }

    });

    return WorkAreaView
});
