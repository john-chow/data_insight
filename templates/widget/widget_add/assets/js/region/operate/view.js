define([
    "text!region/operate/template/buttons"
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
            }
        })
    })
})
