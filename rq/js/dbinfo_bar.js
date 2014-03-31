define([
"jquery"
, "backbone"
, "underscore"
, "bootstrap"
, "text!../template/dbinfo_bar.html" 
], function($, Backbone, _, b, dataAreaHtml) {

    var DbInfoBarView = Backbone.View.extend({

        tagName:    "div",
        id:         "dbinfo_bar",
        template:   dataAreaHtml,

        events: {
        },

        initialize: function() {
            this.listenTo(this.model, "change", this.onDbChanged);

            // 这里应该是model向服务器请求数据
            this.model.simulateData();
        },

        render: function() {
            this.$el.html( _.template(this.template, this.model.toJSON(), {variable: "model"}) );
        },

        onDbChanged: function() {
            this.render();
            this.$(".mension, .measure").on("dragstart", this.drag);
        },

        drag: function(ev) {
           //ev.originalEvent.dataTransfer.setData( "text/plain", $(ev.target).html() );
           sessionStorage.dragContent=$(ev.target).html();//把数据放在session
        }

    });

    return DbInfoBarView;
})

