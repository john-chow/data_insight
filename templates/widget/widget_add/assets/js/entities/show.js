define([
    "entities/entrance"
], function () {
    DataInsightManager.module("Entities"
        , function(Entities, DataInsightManager, Backbone, Marionette, $, _) {

        Entities.Show = Backbone.Model.extend({
            initialize:     function() {
                Entities.entAPI.setRelation("additional", this, null);
            },

            ready:           function() {
                // 从startSnapshot开始，到finishSnapshot结束
                return $.when(this.startSnapshot())
            },

            startSnapshot:      function() {
                var defer = $.Deferred();
                this.trigger("snapshot:take", defer);
                return defer
            },

            finishSnapshot:     function(snapshot, defer) {
                this.set("snapshot", snapshot);
                defer.resolve()
            },

            setSnapshot:        function(snapshot) {
                this.set("snapshot", snapshot)
            }
        });

        var API = {
            getShowEntity:  function() {
                if (undefined === Entities.show)
                    Entities.show = new Entities.Show
                return Entities.show
            }
        };

		//设置marionatte请求响应，获取图表实体
		DataInsightManager.reqres.setHandler("show:entity", function(){
            return API.getShowEntity();
		});
    })
})
