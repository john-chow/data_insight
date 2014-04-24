define([
"jquery"
, "backbone"
, "bootstrap"
, "text!../template/error_message.html" 
], function($, Backbone, x, messageHtml) {

    var MessageView = Backbone.View.extend({

        tagName: "div",
        id: "error_modal",

        events: {
        },

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(messageHtml);
        },

    });

    return MessageView;
});
