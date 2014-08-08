define([
    'entities/show'
    , 'region/show/view'
], function() {
	DataInsightManager.module("ShowRegion"
        , function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _) {

        ShowRegion.Controller = function() {
            this.entrance = DataInsightManager.request("entrance:entity");
            this.showController = DataInsightManager.request("show:entity");
            this.showView = new ShowRegion.Board();
            DataInsightManager.showRegion.show(this.showView);

            DataInsightManager.commands.setHandler("widget:save", function() {
                var snapshot = this.showView.getSnapshot();
                this.showController.trigger("snapshot:take", snapshot)
            });

            DataInsightManager.commands.setHandler("widget:back", function() {
            });

            DataInsightManager.commands.setHandler("board:inflate", function() {
            });

            DataInsightManager.commands.setHandler("board:deflate", function() {
            });

            DataInsightManager.commands.setHandler("board:draw", function(resp) {
                if (resp.succ)      this.showView.draw(resp.data)
            });

        };

        ShowRegion.Controller.prototype = {
        }
    })
})

