define([
"backbone"
, "dbinfo_bar"
, "design_panel"
, "bootstrap"
, "model/vtron_model"
, "model/dbinfo"
], function(Backbone, DbBarView, PanelView, b, VtronModel, 
	DbInfoModel) {

	var WorkAreaModel = VtronModel.extend({
		urlRoot: "/indb/draw/"
	});

    var WorkAreaView = Backbone.View.extend({

        tagName: 	"div",
        id: 		"work_area",
        className: 	"clearfix",

        initialize: function() {
			Backbone.Events.on(
				"area:user_action"
				, _.bind(this.updateToSev, this)
		  	);

			this.model 		= new WorkAreaModel();
            var dbModel     = new DbInfoModel;
            this.dbBarView  = new DbBarView( {model: dbModel} );
            this.panelView  = new PanelView( {dbModel: dbModel} );
            this.render();
        },

        render: function() {
            this.$el.append(
                this.dbBarView.el, this.panelView.el
            );
        },

		updateToSev: function(data) {
			this.model.set(data);
			this.model.save(null, {
				success: function(m, resp, opt) {
					if (resp.succ) {
						Backbone.Events.trigger("panel:draw_data", resp.data)
					} else {
					}
				}, error: function() {
				}
			})
		}	

    });

    return WorkAreaView
});
