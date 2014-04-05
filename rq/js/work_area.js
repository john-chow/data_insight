define([
"backbone"
, "dbinfo_bar"
, "design_panel"
, "bootstrap"
, "model/dbinfo"
], function(Backbone, DbBarView, PanelView, b, DbInfoModel) {
    var WorkAreaView = Backbone.View.extend({

        tagName: "div",
        id: "work_area",
        className: "clearfix",

        initialize: function() {
            var dbModel     = new DbInfoModel;
            this.dbBarView  = new DbBarView( {model: dbModel} );
            this.panelView  = new PanelView( {dbModel: dbModel} );
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
