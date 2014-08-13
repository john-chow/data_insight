define([
    "region/show/drawer"
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
                this.drawerMgr = new DrawManager();
            },

            draw:           function(data) {
                this.drawerMgr.run(this.el, data)
            },

            clear:          function() {
                var ec = this.drawerMgr.getEc();
                ec && ec.clear()
            },

            getSnapshot:    function() {
                var zr = this.drawerMgr.getEc().getZrender();
                var snapshot = zr.toDataURL("image/png");
                return snapshot
            }
        });
    })

    return ShowRegionView
})
