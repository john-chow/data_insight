define([
    'entities/show'
    , 'region/show/view'
], function() {
	DataInsightManager.module("ShowRegion"
        , function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _) {

        ShowRegion.Controller = function() {
            var self = this;
            self.entranceModel = DataInsightManager.request("entrance:entity");
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
                if (resp.succ) {
                    CleanPrompt()
                    self.showView.draw(resp.entity);
                } else {
                    self.showView.clear();
                    PromptMsg(resp.msg)
                }
            });

            DataInsightManager.commands.setHandler("style:try", function(style) {
                self.showView.tryStyle(style)
            });

            DataInsightManager.commands.setHandler("widget:save", function() {
                var snapshot = self.showView.takeSnapshot();
                self.showModel.setSnapshot(snapshot);

                self.entranceModel.toSave()
            });
        }

        ShowRegion.Controller.prototype.showShowView    = function() {
             DataInsightManager.showRegion.show(this.showView, {preventDestroy: true});
        }
    })
})

