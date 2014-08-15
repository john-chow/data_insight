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
            defaults:       {
                'list':     []
            },
    
            merge:              function() {
                var data = {};
                $.each(this.get('list'), function(i, m) {
                    data = _.extend(data, m.toJSON())
                })
                return data
            },

            register:           function(model, eventname) {
                this.get('list').push(model);
                this.listen && this.listen(eventname)
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
            initialize:         function() {
            }
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
/*
                DataInsightManager.commands.setHandler(
                    "widget:save", $.proxy(this.onSave, this)
                );
*/
            },

            classify:       function(kind, model, changeEvent) {
                var concreteModel = this.get(kind);
                concreteModel.register(model, changeEvent);
            },

            toSave:           function() {
                var data = this.merge();
                this.save(data, {
                    wait:       true
                    , success:    function(m, resp) {
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


        // Entities内部接口
        Entities.entAPI = {
            setRelation:            function(kind, model, changeEvent) {
                Entities.entranceFascade.classify(kind, model, changeEvent)
            }
            , getWidgetData:      function() {
                var defer = $.Deferred();
                Entities.entranceFascade.fetch({
                    success:    function(m, resp) { defer.resolve(resp.data) }
                    , error:      function() {defer.reject(undefined)}
                })
                return defer.promise()
            }
        };

        // 全局接口
        var API = {
            getEntranceEntity:      function() {        
                return Entities.entranceFascade
            }
        };


		DataInsightManager.reqres.setHandler("entrance:entity", function(){
            return API.getEntranceEntity();
		});

    })
})


