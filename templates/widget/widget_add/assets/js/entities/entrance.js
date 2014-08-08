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
                $.each(this.list, function(i, m) {
                    data = _.extend(data, m.toJSON())
                })
                return data
            },

            register:           function(model) {
                this.list.push(model)
            }
        });


        /*
         * 图表形成类
         */
        Entities.DrawEntrance = Entities.BaseEntrance.extend({
            url:                "/widget/draw/",

            listen:             function() {
                Entities.on("graph:change filter:change", $.proxy(this.draw, this));
            },

            draw:               function() {
                var data = this.merge();
                this.save(data, {
                    success:  function(m, resp) {
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
        	url:                function() {
                if (window.widgetId)       
                    return "/widget/edit/"
                else        
                    return "/widget/create/"
            },
        	
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

            register:       function(kind, model) {
                this.get(kind).register(model);
            },

            save:           function() {
                var data = this.merge();
                this.save(data, {
                    success:    function(m, resp) {
                    }
                });
            },

            merge:          function() {
                var drawData = this.drawModel.merge();
                var additionalData = this.additionalModel.merge();
                return _.extend(drawData, additionalData)
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


