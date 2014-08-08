define([
    'entities/entrance'
    , 'region/show/view'
], function() {
	DataInsightManager.module("ShowRegion"
        , function(ShowRegion, DataInsightManager, Backbone, Marionette, $, _) {

        ShowRegion.Controller = function() {
        	var obj = {
        			initialize: function(){
        				this.entrance = DataInsightManager.request("entrance:entity");
        	            this.showView = new ShowRegion.Board();
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
        			},
        			showShowView: function(){
        				 DataInsightManager.showRegion.show(this.showView, {preventDestroy: true});
        			}
        	}
        	obj.initialize();
        	return obj;
        };

        ShowRegion.Controller.prototype = {
        }
    })
})

