define([
    'entities/show'
    , 'region/show/view'
], function() {
	DataInsightManager.module("ShowRegion"
        , function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _) {

        ShowRegion.Controller = function() {
            var self = this;
            self.entrance = DataInsightManager.request("entrance:entity");
            self.showModel = DataInsightManager.request("show:entity");
            self.showView = new ShowRegion.Board();
            DataInsightManager.showRegion.show(self.showView, {preventDestroy: true});

            self.showModel.on("snapshot:take", function(defer) {
                var snapshot = self.showView.getSnapshot();
                self.showModel.finishSnapshot(snapshot, defer)
            })

            DataInsightManager.commands.setHandler("widget:back", function() {
            });

            DataInsightManager.commands.setHandler("board:inflate", function() {
            });

            DataInsightManager.commands.setHandler("board:deflate", function() {
            });

            DataInsightManager.commands.setHandler("board:draw", function(resp) {
                if (resp.succ)      self.showView.draw(resp.data)
                else                self.showView.clear()
            });
        }

        ShowRegion.Controller.prototype.showShowView    = function() {
             DataInsightManager.showRegion.show(this.showView, {preventDestroy: true});
        }
    })
})

