define([
"backbone"
, "base_sheet"
, "dbinfo_bar"
, "design_panel"
, "bootstrap"
, "model/vtron_model"
, "vtron_events"
], function(Backbone,BaseSheetView, DbBarView, PanelView, b, VtronModel
			, VtronEvents) {

	var WorkAreaModel = VtronModel.extend({
		urlRoot: "/widget/draw/",
		
		initialize: function() {
			this.set(this.default)
		}	
	});



    var WorkAreaView = BaseSheetView.extend({

        tagName: 	"div",
        id: 		"work_area",
    /*    className: 	"clearfix",*/

        initialize: function() {

			//Backbone.Events.on(
			this.onOut(
				"area:user_set_action"
				, _.bind(this.setToSev, this)
		  	);

			this.onOut(
				"area:change_table"
				, _.bind(this.changeTable, this)
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

			var self = this;
			this.model.save(null, {
				success: function(m, resp, opt) {
					if (resp.succ) {
						self.triggerOut("panel:draw_data", resp.data)
					} else {
						easy_dialog_error(resp.msg)						
						// 通知清空
						self.triggerOut("panel:draw_data", {})
					}
				}, error: function() {
				},
				no_feeding: true
			})
		},

		changeTable: function(data) {
			this.model.set(data)
		}

    });

    return WorkAreaView
});
