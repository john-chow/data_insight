define([
"jquery"
, "backbone"
, "bootstrap"
, "text!../template/draw_workplace.html" 
], function($, Backbone, b, workspaceHtml) {

    var DrawWorkspaceView = Backbone.View.extend({

        
        tagName:    "div",
        id:         "draw_workplace",

        events: {
            "dblclick"                                           : "open",
            "click .icon.doc"                                    : "select",
            "mouseenter #column_sortable li,#row_sortable li"    : "showClose",
            "mouseleave #column_sortable li,#row_sortable li"    : "hideClose",
            "click .plots_close"                                 : "deleteLi",
            "mouseout .plots_close"                              : "hideCloseByOut"
          },

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(workspaceHtml);
        },

        showClose: function(ev) {
            $(ev.target).append("<button type='button' class='plots_close'>&times;</button>");
        },

        hideClose: function(ev) {
            $(ev.target).find("button").remove();
        },

        hideCloseByOut: function(ev) {
            $(ev.target).remove();
        },

        deleteLi: function(ev) {
            $(ev.target).parent().remove();
        }

    });

    return DrawWorkspaceView;
})
