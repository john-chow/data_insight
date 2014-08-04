define([
    'entities/entrance'
    , 'region/show/view'
], function() {
	DataInsightManager.module("ShowRegion"
        , function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _) {

        ShowRegion.Controller = function() {
            this.entrance = DataInsightManager.request("entrance:entity");
            this.showView = new ShowRegion.Board();
            DataInsightManager.showRegion.show(this.showView);

            DataInsightManager.commands.setHandler("widget:save", function() {
            });

            DataInsightManager.commands.setHandler("widget:back", function() {
            });

            DataInsightManager.commands.setHandler("board:inflate", function() {
            });

            DataInsightManager.commands.setHandler("board:deflate", function() {
            });

            DataInsightManager.commands.setHandler("board:draw", function() {
            });

        };

        ShowRegion.Controller.prototype = {
        }
    })
})

