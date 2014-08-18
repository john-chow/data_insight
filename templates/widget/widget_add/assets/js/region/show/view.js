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
                this.ec = null;
            },

            draw:           function(data) {
                this.drawerMgr.run(this.el, data);
                this.ec = this.drawerMgr.getEc()
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
                this.ec.setTheme(style)
            }
        });
    })

    return ShowRegionView
})
