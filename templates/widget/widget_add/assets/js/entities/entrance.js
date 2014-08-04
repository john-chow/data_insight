define([
    'entities/graph'
    , 'entities/filter'
    , 'entities/property'
], function () {
    DataInsightManager.module("Entities"
        , function(Entities, DataInsightManager, Backbone, Marionette, $, _) {
        
        /*
         * 聚合外部Model，自己不存任何实质数据
         */
        Entities.BaseEntrance = Backbone.Model.extend({
            initialize:          function() {
                this.list   = [];
                this.listen && this.listen();
            },

            merge:              function() {
                var data = {};
                $.each(this.list, function(m) {
                    $.merge(data, m.toJSON())
                })
                return data
            },

            register:           function(models) {
                var self = this;
                $.each(models, function(i, m) {
                    self.list.push(m)
                })
            }
        });


        /*
         * 图表形成类
         */
        Entities.DrawEntrance = Entities.BaseEntrance.extend({
            url:                "",

            listen:             function() {
                Entities.on("graph:change filter:change", $.proxy(this.draw, this));
            },

            draw:               function() {
                var data = this.merge();
                this.save({
                    data:       data
                    , success:  function() {
                        DataInsightManager.commands.execute("board:draw")
                    }
                })
            }
        });


        /* 
         * 图表辅助类
         */
        Entities.AdditionalEntrance = Entities.BaseEntrance.extend({
        });


        /*
         * 对外提供的接口类，组件的save和fetch的通道
         */
        Entities.EntranceFascade = Backbone.Model.extend({
            initialize:     function() {
                this.set({
                    "draw":             new Entities.DrawEntrance
                    , "additional":     new Entities.AdditionalEntrance
                });

                Entities.on("toFetch", $.proxy(this.onReqWidgetData, this));
                DataInsightManager.commands.setHandler(
                    "widget:save", $.proxy(this.save, this)
                );
            },

            register:       function(kind, models) {
                this.get(kind).register(models);
            },

            save:           function() {
                var data = this.merge();
                this.save({"data": data});
            },

            merge:          function() {
                var drawData = this.drawModel.merge();
                var additionalData = this.additionalModel.merge();
                return $.extend({}, drawData, additionalData)
            },

            onReqWidgetData:        function(e) {
                var self = this;
                self.fetch({
                    "success":  function(m, resp) {
                        e.func(resp.data, e.arg);
                    }
                })
            }
        });


        (function() {
            if (Entities.entranceFascade === undefined) {
                Entities.entranceFascade = new Entities.EntranceFascade;
            }
            return Entities.entranceFascade
        })()

    })
})


