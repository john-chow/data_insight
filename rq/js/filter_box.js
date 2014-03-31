define([
"jquery"
, "backbone"
, "underscore"
, "bootstrap"
, "text!../template/filter_box.html"
], function($, Backbone, _, b, filterBoxHtml) {

    var FilterBoxView = Backbone.View.extend({

        tagName:    "div",
        id:         "filter_box",
        template:   filterBoxHtml,

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(filterBoxHtml);
        }
    });

    return FilterBoxView;
});
