define([
"jquery"
, "backbone"
, "underscore"
, "draw_workplace"
, "choose_filter"
, "bootstrap"
, "filter_box"
], function($, Backbone, _, DrawPlaceView, ChooseFilterView, b, 
            filterBoxView) {

    var FilterModel = Backbone.Model.extend({
    });
    
    var DesignPanelView = Backbone.View.extend({

        tagName:            "div",
        id:                 "design_panel",
        className:          "clearfix",
        filterContentTem:   _.template("<span class='filter_content'><%= content %></span><br />"),

        /*
        events: {
            "drop .design-column":      this.drop,
            "drop .design-row":         this.drop
        },
        */

        initialize: function(opt) {
            this.dbModel = opt.dbModel;
            this.filterModel = new FilterModel();

            this.filterBoxView = new filterBoxView();

            this.drawPlaceView = new DrawPlaceView();
            this.chooseFilterView = new ChooseFilterView( 
                { model: new ( Backbone.Model.extend({}) ) }
            );
            this.chooseFilterView.on("choose_filter", this.addFilter);


            this.render();
            //this.$("#column_sortable, #row_sortable").on("drop", this.dropInPlots);
            //_.bind(function, object, [*arguments]) :绑定函数 function到对象object 上,也就是无论何时调用函数, 函数里的this都指向这个object
            this.$("#filter_conditions").on( "drop", _.bind(this.chooseFilter, this) );
        },

        render: function() {
           this.$el.html("");
            this.$el.append(
                this.filterBoxView.el
                , this.drawPlaceView.el
                , "<div id='info_workplace'>工作表1</div>"
            );
        },

        dropInPlots: function(ev) {
            // 先把数据放进text里面，然后ajax到服务器
            //var data = ev.originalEvent.dataTransfer.getData("text/plain");
           /* $(ev.target).val( function(index, oldVal){
                return oldVal + " " + $("#" + data).html()
            });*/
        },

        chooseFilter: function(ev) {
            //var data = ev.originalEvent.dataTransfer.getData("text/plain");
            var data=sessionStorage.dragContent;
            this.chooseFilterView.model.set( {"fil": this.dbModel.getContentsBykey(data)} ); 
            this.chooseFilterView.model.set( {"title":data} );
            this.chooseFilterView.render();
        },

        addFilter: function(ev) {
            //var data = ev.originalEvent.dataTransfer.getData("text/plain");
            var data=sessionStorage.dragContent;
            this.$("#filter_body").append(
                this.filterContentTem( {"content": data} )
            );

            this.filterModel.save();
        }
    });

    return DesignPanelView;
});

