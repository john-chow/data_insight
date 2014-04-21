define([
"jquery"
, "backbone"
, "bootstrap"
, "model/vtron_model"
, "text!../template/intelligent_display.html" 
], function($, Backbone, b, VtronModel, intelligentHtml) {

    var ChartStyleModel   = VtronModel.extend({
            urlRoot:        "chart/"
        });


    var IntelligentHtml = Backbone.View.extend({

        tagName: "li",
        id: "intelligent_display",
        className: "intelligent-display",

        events: {
            "click .intelligent-display-name":                "changeIntelligentDisplay"
            ,"mouseover .intelligent-display-pic button":     "showTips"
            ,"click .intelligent-display-pic button":         "chooseChartStyle"
        },

        initialize: function() {
            this.model= new ChartStyleModel();
            this.render();
        },

        render: function() {
            this.$el.html(intelligentHtml);
        },

        changeIntelligentDisplay: function(e) {
            if(this.$(".intelligent-display-pic").css("display") == "none")
                this.$(".intelligent-display-pic").slideDown("normal");
            else
                this.$(".intelligent-display-pic").slideUp("normal");
        },

        showTips: function(ev) {
            this.$(".intelligent-display-tips").html("提示："+$(ev.target).attr("title"));
        },

        chooseChartStyle: function(ev) {
            $(".choosed-chart-style").removeClass("choosed-chart-style");
            $(ev.target).addClass("choosed-chart-style");
            var chartStyle = $(ev.target).attr("chartName");
            this.model.set("shape", chartStyle);
            this.model.myPass();
        }

    });

    return IntelligentHtml;
});
