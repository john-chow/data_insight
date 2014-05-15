define([
"backbone"
, "base_sheet"
, "dbinfo_bar"
, "design_panel"
, "data_center"
], function(Backbone,BaseSheetView, DbBarView, PanelView
			, DataCenter) {

    var WorkAreaView = BaseSheetView.extend({

        tagName: 	"div",
        id: 		"work_area",

        initialize: function() {
			new DataCenter();

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
