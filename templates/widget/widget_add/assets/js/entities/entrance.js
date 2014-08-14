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
            },

            merge:              function() {
                var data = {};
                var operate = function(m) {
                    return function() {
                        data = _.extend(data, m.toJSON());
                    } 
                };

                $.each(this.list, function(i, m) {
                    if (m.ready)    m.ready().done(operate(m))
                    else            operate(m)()
                })
                return data
            },

            register:           function(model) {
                this.list.push(model)
            },

            // 此函数作用，本model不把服务器返回值设为属性
            parse:              function() {
                return {}
            }
        });


        /*
         * 图表形成类
         */
        Entities.DrawEntrance = Entities.BaseEntrance.extend({
            url:                "/widget/draw/",

            listen:             function(name) {
                Entities.on(name, $.proxy(this.onChange, this));
            },

            onChange:               function() {
                var data = this.merge();
                this.save(data, {
                    success:  function(m, resp) {
                        DataInsightManager.commands.execute("board:draw", resp)
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
                    return "/widget/update/" + window.widgetId
                else        
                    return "/widget/create/"
            },
        	
            initialize:     function() {
                this.set({
                    "draw":             new Entities.DrawEntrance
                    , "additional":     new Entities.AdditionalEntrance
                });

                Entities.on("design:initial", $.proxy(this.onReqWidgetData, this));
                DataInsightManager.commands.setHandler(
                    "widget:save", $.proxy(this.onSave, this)
                );
            },

            register:       function(kind, model, changeEvent) {
                var concreteModel = this.get(kind);
                concreteModel.register(model);
                concreteModel.listen && concreteModel.listen(changeEvent)
            },

            onSave:           function() {
                var data = this.merge();
                this.save(data, {
                    wait:       true
                    , success:    function(m, resp) {
/*
                        $.ajax('/connect/field/', {
                            type:       'GET'
                            , dataType: 'json'
                            , data:     {
                                'aa':   true,
                                'bb':   123
                            }
                        })
*/
                    }
                });
            },

            merge:          function() {
                var drawData = this.get("draw").merge();
                var additionalData = this.get("additional").merge();
                return _.extend({}, drawData, additionalData)
            },

            parse:              function() {
                return {}
            },

            onReqWidgetData:        function(e) {
                var self = this;
                self.fetch({
                    success:  function(m, resp) {
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


