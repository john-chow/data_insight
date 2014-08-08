define([
    "region/show/drawer"
], function(DrawManager) {

	var ShowRegionView = DataInsightManager.module("ShowRegion",
		    function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _){

        ShowRegion.Board = Marionette.ItemView.extend({
            tagName:        "div",
            className:      "container",
            template:       function() {
                return ""
            },

            initialize:     function() {
                this.drawerMan = new DrawManager();
            },

            draw:           function(data) {
                this.drawerMan.run(this.el, data)
            },

            getSnapshot:    function() {
                var zr = this.drawerMan.getEc().getZrender();
                var snapshot = zr.toDataURL("image/png");
                return snapshot
            }
        });
    })

    return ShowRegionView
})
