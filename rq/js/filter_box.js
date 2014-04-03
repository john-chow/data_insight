define([
"jquery"
, "backbone"
, "underscore"
, "bootstrap"
, "model/filter_boxes"
, "text!../template/filter_box.html"
], function($, Backbone, _, b, FiltersCollection, filterBoxHtml) {

    var FilterBoxView = Backbone.View.extend({

        tagName:    "div",
        id:         "filter_box",
        template:   filterBoxHtml,

        initialize: function() {
			this.collection = new FiltersCollection();
            this.render();
        },

        render: function() {
            this.$el.html(filterBoxHtml);
        }
    });

    return FilterBoxView;
});
