define([
"backbone"
, "bootstrap"
, "model/vtron_model"
, "text!../template/intelligent_display.html" 
], function(Backbone, b, VtronModel, intelligentHtml) {

    var ChartStyleModel   = VtronModel.extend({
            urlRoot:        "chart/"
        });


    var IntelligentHtml = Backbone.View.extend({

        tagName: "div",
        id: "intelligent_display",
        className: "intelligent-display",

        events: {
            "click .intelligent-display-name":                "changeIntelligentDisplay"
            ,"mouseover .intelligent-display-pic button":     "showTips"
            ,"mouseleave .intelligent-display-pic":            "hideDisplay"
            //,"click .intelligent-display-pic button":         "chooseChartStyle"
        },

        initialize: function() {
            this.model= new ChartStyleModel();
            this.render();

            // 监听
            Backbone.Events.on("display:restore_graph", _.bind(this.setGraph, this));

            // 如何让托管事件在更早之前就启动呢？
            this.$(".intelligent-display-pic button")
                .on("click", _.bind(this.chooseChartStyle, this));

            // 默认选中bar
            this.setGraph("bar");
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
            this.model.set("graph", chartStyle);
            this.model.myPass();
        },

        setGraph:    function(attr) {
            this.$(".intelligent-display-pic button[chartname='"+attr+"']")[0].click();
        },
        hideDisplay: function(){
            this.$(".intelligent-display-pic").slideUp("normal");
        }
    });

    return IntelligentHtml;
});
