define([
    'entities/graph'
    , 'entities/filter'
    , 'entities/property'
    , 'common/mapping'
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
                	try{
                		/*
                		* 由于过滤器的实体设计的attributes不是所有都是服务器所需要的数据，所以写了toJson方法
                		* 其只json化服务器所需要的数据，即filters属性
                		*/
                		data = _.extend(data, m.toJSON());
                	}catch(e){
                		data = _.extend(data, m.toJSON());
                	}
                   
                })
                return data;
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
            url:                 "/widget/draw/",

            initialize:         function() {
                _.bindAll(this, "reqRedraw")
            },

            listen:             function(name) {
                Entities.on(name, this.reqRedraw);
            },

            reqRedraw:             function() {
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
                this.interval = null;
                _.bindAll(this, "changeRefresh", "changeStyle", "onEditWidget")
            },

            listen:         function(name) {
                Entities.on(name, this.onEditWidget);
                Entities.on("autoRefresh:change", this.changeRefresh);
                Entities.on("style:change", this.changeStyle)
            },

            onEditWidget:       function(data) {
                if("0" != data.autoRefresh)     this.changeRefresh(data)
                if(data.style)     this.changeStyle(data)
            },

            changeRefresh:    function(data) {
                var timesec = cvtToTime(data.autoRefresh);
                var self = this;
                if (timesec > 0) {
                    self.interval && clearInterval(self.interval);
                    self.interval = setInterval(function() {
                        self.trigger("refresh:notice")
                    }, timesec)
                } else {
                    clearInterval(self.interval);
                    self.interval = null
                }
            },

            changeStyle:        function(data) {
                DataInsightManager.commands.execute("style:try", data.style)
            }
        });



        /*
         * 图表更新类
         */
        Entities.RefreshEntrance = Backbone.Model.extend({
            url:        "/widget/refresh/" + window.widgetId + "/",

            initialize:     function() {
                _.bindAll(this, "reqRefresh")
            },

            reqRefresh:       function() {
                this.fetch({
                    success:  function(m, resp) {
                        DataInsightManager.commands.execute("board:draw", resp)
                    }
                })
            }
        });



        /*
         * 对外提供的接口类，组件的save和fetch的通道
         */
        Entities.EntranceFascade = Backbone.Model.extend({
        	url:                function() {
                if (window.widgetId)       
                    return "/widget/update/" + window.widgetId + "/"
                else        
                    return "/widget/create/"
            },
        	
            initialize:     function() {
                this.set({
                    "draw":             new Entities.DrawEntrance
                    , "additional":     new Entities.AdditionalEntrance
                    , "refresh":        new Entities.RefreshEntrance
                });

                this.drawEntrance = this.get("draw");
                this.adtEntrance = this.get("additional");
                this.refreshEntrance = this.get("refresh");
                this.adtEntrance.on(
                    "refresh:notice", this.refreshEntrance.reqRefresh
                );

                Entities.on("design:initial", $.proxy(this.onReqWidgetData, this));
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
                var drawData = this.drawEntrance.merge();
                var additionalData = this.adtEntrance.merge();
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


