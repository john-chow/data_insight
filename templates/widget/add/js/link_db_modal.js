define([
"backbone"
, "bootstrap"
, "text!../template/link_db_modal.html" 
], function(Backbone, b, ldmTemplate) {

    var linkDbModal = Backbone.View.extend({

        events: {
            "click .link_db_cancel":                "close"
            , "click .link_db_ok":                  "ensureFilter"
        },

        initialize: function() {

        },

        render: function() {
            this.remove();
            this.setElement(ldmTemplate);
            this.$el.modal("show");
        },

        close: function() {
            this.$el.modal("hide");
        },

        ensureFilter: function() {

        }
    });

    return linkDbModal;
})
