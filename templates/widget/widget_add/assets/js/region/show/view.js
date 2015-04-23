define([
    "/static/js/drawer.js"
], function(DrawManager) {

	var ShowRegionView = DataInsightManager.module("ShowRegion",
		    function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _){

        ShowRegion.Board = Marionette.ItemView.extend({
            tagName:        "div",
            className:      "show_container",
            id:             "show_container_id",
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
                var ec = this.drawerMgr.getEc();
                ec && ec.clear()
            },

            takeSnapshot:    function() {
                var ec = this.drawerMgr.getEc();
                if (!ec)       return ''

                var zr = ec.getZrender();
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
