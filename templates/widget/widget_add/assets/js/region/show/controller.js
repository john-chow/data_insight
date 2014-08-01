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
        };

        ShowRegion.Controller.prototype = {
        }
    })
})

