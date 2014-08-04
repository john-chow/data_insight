define([
], function() {

	var ShowRegionView = DataInsightManager.module("ShowRegion",
		    function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _){

        ShowRegion.Board = Marionette.ItemView.extend({
            tagName:        "div",
            className:      "container",
            template:       function() {
                return ""
            }
        });
    })

    return ShowRegionView
})
