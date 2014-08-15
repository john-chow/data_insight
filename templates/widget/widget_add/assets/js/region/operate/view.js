define([
    "text!region/operate/template/strip.html"
], function(buttonsHtml) {
    
	DataInsightManager.module("OperateRegion"
        , function(OperateRegion, DataInsightManager, Backbone, Marionette, $, _) {

        OperateRegion.Command = Marionette.ItemView.extend({
            template:       buttonsHtml,

            events:     {
                "click .save":          "saveClicked"
                , "click .back":        "backClicked"
                , "click .inflate":     "inflateClicked"
                , "click .defalte":     "deflateClicked"
            },

            saveClicked:    function() {
                this.trigger("save:clicked")
            },

            backClicked:    function() {
                this.trigger("back:clicked")
            },

            inflateClicked:  function() {
                this.trigger("inflate:clicked")
            },

            deflateClicked:  function() {
                this.trigger("deflate:clicked")
            },

            onShowMessage: function(message) {
            	var self = this;
            	this.$("#widget_operate_tip").show().find(".bg-primary").html(message);
            	setTimeout(function(){
					self.$("#widget_operate_tip").fadeOut("slow");
            	}, 5000)
            }
        })
    })
})
