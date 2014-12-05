define([
    "/static/js/drawer.js"
], function(DrawManager) {

	var ShowRegionView = DataInsightManager.module("ShowRegion",
		    function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _){

        ShowRegion.Board = Marionette.ItemView.extend({
            tagName:        "div",
            className:      "show_container",
            template:       function() {
                return ""
            },

            initialize:     function() {
                this.drawerMgr = new DrawManager(this.el);
            },

            onShow:         function() {
            },

            draw:           function(data) {
                this.drawerMgr.draw(data);
            },

            clear:          function() {
                this.ec && this.ec.clear()
            },

            takeSnapshot:    function() {
                if (!this.ec)       return ''

                var zr = this.ec.getZrender();
                var snapshot = zr.toDataURL("image/png");
                return snapshot
            },
        
            tryStyle:       function(style) {
                this.drawerMgr.setStyle(style)
            }
        });
    })

    return ShowRegionView
})
