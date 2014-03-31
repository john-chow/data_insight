define([
"jquery"
, "backbone"
, "underscore"
, "bootstrap"
, "text!../template/choose_filter.html" 
], function($, Backbone, _, b, cfTemplate) {

    var ChooseFilter = Backbone.View.extend({


        template: cfTemplate,

        events: {
            "click .filter_cancel":                "close"
            , "click .filter_reset":               "render"
            , "click .filter_ok":                  "ensureFilter"
            , "click #choose_filter_all":          "chooseAll"
            , "click #choose_filter_none":         "chooseNone"
        },

        initialize: function() {
            //this.listenTo(this.model, "change", this.render);
           /* this.$el.modal({
                show: false
                //, keyboard: false
            });*/
        },

        render: function() {
            this.remove();
            this.setElement( 
                _.template(this.template, this.model.toJSON(), {"variable": "model"}) 
            );
            this.$el.modal("show");
        },

        close: function() {
            this.$el.modal("hide");
        },

        ensureFilter: function() {
          //  this.trigger( "choose_filter", {} );

        },

        chooseAll: function(){
             this.$(":checkbox").attr("checked", true);
             this.$(":checkbox").prop('checked',true);//jquery操作checkbox问题：如果没有本行，第二次设置将不起作用
        },

        chooseNone: function(){
            this.$(":checkbox").attr("checked", false);
            this.$(":checkbox").prop('checked',false);
        }


    });

    return ChooseFilter;
})
