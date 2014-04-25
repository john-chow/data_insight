define([
"backbone"
, "dbinfo_bar"
, "design_panel"
, "bootstrap"
, "model/vtron_model"
, "vtron_events"
], function(Backbone, DbBarView, PanelView, b, VtronModel
			, VtronEvents) {

	var WorkAreaModel = VtronModel.extend({
		urlRoot: "/indb/draw/",
		
		initialize: function() {
			this.set(this.default)
		}	
	});



    var WorkAreaView = Backbone.View.extend({

        tagName: 	"div",
        id: 		"work_area",
        className: 	"clearfix",

        initialize: function() {

			Backbone.Events.on(
				"area:user_set_action"
				, _.bind(this.setToSev, this)
		  	);

		  	Backbone.Events.on(
				"area:user_unset_action"
				, _.bind(this.unsetToSev, this)
		  	);

			this.model 		= new WorkAreaModel();
            this.dbBarView  = new DbBarView();
            this.panelView  = new PanelView();
            this.render();
        },

        render: function() {
            this.$el.append(
                this.dbBarView.el, this.panelView.el
            );
        },

		setToSev: function(data) {
			this.model.set(data);
			this.model.save(null, {
				success: function(m, resp, opt) {
					if (resp.succ) {
						Backbone.Events.trigger("panel:draw_data", resp.data)
					} else {
						Backbone.Events.trigger("panel:draw_data", {})
					}
				}, error: function() {
				},
				no_feeding: true
			})
		},

		unsetToSev: function(data) {
			this.model.unset(data);
			this.model.save(null, {
				success: function(m, resp, opt) {
					if (resp.succ) {
						Backbone.Events.trigger("panel:draw_data", resp.data)
					} else {
						Backbone.Events.trigger("panel:draw_data", {})
					}
				}, error: function() {
				},
				no_feeding: true
			})
		}		

    });

    return WorkAreaView
});
