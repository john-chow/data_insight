define([
"backbone"
, "base_sheet"
, "bootstrap"
, "text!../template/widget_modal.html" 
], function(Backbone, BaseSheetView, b, cfTemplate) {

    var FilterModel = Backbone.Model.extend({
    });

    var ChooseFilter = Backbone.View.extend({

        template: cfTemplate,

        events: {
            "click .filter_cancel":                "close"
        },

        initialize: function() {
			this.model = new FilterModel();
        },

        render: function() {
           // this.remove();
            this.setElement( 
                _.template(this.template, this.model.toJSON(), {"variable": "model"}) 
            );
            this.show()
        },

		show: function() {
			this.$el.modal("show")
		},

        close: function() {
            this.$el.modal("hide");
        },

    });

    return ChooseFilter;
})
