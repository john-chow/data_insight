define([], function () {
    var EntranceEntity = DataInsightManager.module("Entities"
        , function(Entities, DataInsightManager, Backbone, Marionette, $, _) {
        
        var DrawPrefix      =   "draw";
        var AdditionPrefix  =   "additional";

        Entities.BaseEntrance = Backbone.Model.extend({
            list:               [],

            initalize:          function() {
                this.listen();
                this.on(this.toSaveCmd, this.onGetSaveCmd);
                this.on(this.toFetchCmd, this.onGetFetchCmd)
            },

            listen:         function() {
                var self = this;
                Entities.on("", function()  {
                    self.triggerj
                })


                $.each(self.list, function(m) {
                    m.on("change", function() {
                        self.trigger(this.toSaveCmd)
                    });
                    /*
                    m.on("", function(callback) {
                        self.trigger(this.toFetchCmd, callback)
                    })
                    */
                })
                Entities.on("graph:initial", function(callback) {
                    self.trigger(this.toFetchCmd, callback)
                })
            },

            merge:              function() {
                var data = {};
                $.each(this.list, function(m) {
                    $.merge(data, m.toJSON())
                })
                return data
            },

            distribute:         function() {
            },

            register:           function(models) {
                $.each(models, function(i, m) {
                    this.list.push(m)
                })
            },

            onGetSaveCmd:       function() {
                var data = this.merge();
                this.save({"data": data})
            },

            onGetFetchCmd:      function(callback) {
                this.fetch({
                    success:    function(m, resp) {
                        callback(resp)
                    }
                })
            }
        });


        /*
         * 图表形成类
         */
        Entities.DrawEntrance = Entities.BaseEntrance.extend({
            toSaveCmd:          DrawPrefix + ":save",
            toFetchCmd:         DrawPrefix + ":fetch",
            url:                "",

            listen:         function() {
            }
        });


        /* 
         * 图表辅助类
         */
        Entities.AdditionalEntrance = Entities.BaseEntrance.extend({
            toSaveCmd:          AdditionPrefix + ":save",
            toFetchCmd:         AdditionPrefix + ":fetch",
            url:                "",

            listen:         function()  {
            }
        });


        /*
         * 对外提供的接口类
         */
        Entities.Entrance = function() {
            this.DrawPrefix     =   new Entities.DrawEntrance;
            this.AdditionPrefix =   new Entities.AdditionalEntrance;

            this.register   =   function(kind, model) {
                this[kind].register(model)
            }
        };


        var API = {
            getEntrance:    function() {
                if (Entities.entrance === undefined) {
                    Entities.entrance = new Entities.Entrance;
                }
                return Entities.entrance
            }
        };

        DataInsightManager.reqres.setHandler("entrance:entities", function(){
            return API.getEntrance();
        });
    })
    
    return EntranceEntity
})
