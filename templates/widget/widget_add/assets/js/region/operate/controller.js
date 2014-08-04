define([
    'region/operate/view'
], function() {
	DataInsightManager.module("OperateRegion"
        , function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _) {

        OperateRegion.Controller = function() {
            this.commandView = new OperateRegion.Command();
            DataInsightManager.operateRegion.show(this.commandView);

            this.commandView.on("save:clicked", function() {
                DataInsightManager.commands.execute("widget:save")
            });

            this.commandView.on("back:clicked", function() {
                DataInsightManager.commands.execute("widget:back")
            });

            this.commandView.on("inflate:clicked", function() {
                DataInsightManager.commands.execute("board:inflate")
            });

            this.commandView.on("deflate:clicked", function() {
                DataInsightManager.commands.execute("board:deflate")
            });

        };

        OperateRegion.Controller.prototype = {
        }
    })
})
