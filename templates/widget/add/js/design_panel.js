define([
"backbone"
, "draw_workplace"
, "bootstrap"
, "filter_box"
, "info_workplace"
], function(Backbone, DrawPlaceView, b, filterBoxView
			, infoWorkplaceView) {

    var DesignPanelView = Backbone.View.extend({

        tagName:            "div",
        id:                 "design_panel",
       /* className:          "clearfix",*/
        filterContentTem:   _.template("<span class='filter_content'><%= content %></span><br />"),

        /*
        events: {
            "drop .design-column":      this.drop,
            "drop .design-row":         this.drop
        },
        */

        initialize: function(opt) {
            //this.dbModel = opt.dbModel;
            //this.filterModel = new FilterModel();

            this.filterBoxView = new filterBoxView();
            //this.infoWorkplaceView = new infoWorkplaceView();

            this.drawPlaceView = new DrawPlaceView();
			/*
            this.chooseFilterView = new ChooseFilterView( 
                { model: new ( Backbone.Model.extend({}) ) }
            );
            this.chooseFilterView.on("choose_filter", this.addFilter);
			this.chooseFilterView.on( "ensure_filter", 
										_.bind(this.ensureFilter, this) );
			*/
			this.filterBoxView.collection.on("add", 
										_.bind(this.filterBoxView.afterModelAdded, this.filterBoxView), 
										this);

			this.startListeners();

            this.render();
            //this.$("#column_sortable, #row_sortable").on("drop", this.dropInPlots);
            //_.bind(function, object, [*arguments]) :绑定函数 function到对象object 上,也就是无论何时调用函数, 函数里的this都指向这个object
            
        },

		startListeners: function() {
            Backbone.Events.on("choose_filter", this.addFilter);
            Backbone.Events.on( "ensure_filter", _.bind(this.ensureFilter, this) )
			//Backbone.Events.on("choose_filter", this.addFilter);
			//Backbone.Events.on( "ensure_filter", _.bind(this.ensureFilter, this) )
		},

        render: function() {
           this.$el.html("");
            this.$el.append(
                this.filterBoxView.el
                , this.drawPlaceView.el
               //, this.infoWorkplaceView.el
            );
        },

		searchData: function() {
			
		},

        dropInPlots: function(ev) {
            // 先把数据放进text里面，然后ajax到服务器
            //var data = ev.originalEvent.dataTransfer.getData("text/plain");
           /* $(ev.target).val( function(index, oldVal){
                return oldVal + " " + $("#" + data).html()
            });*/
        },

			/*
            //var data = ev.originalEvent.dataTransfer.getData("text/plain");
			var data = JSON.parse(sessionStorage.dragment);
			var title = data['content'];
			var proId = data['pro_id'];

            this.chooseFilterView.model.set( {
				"title":		title
				, "fil": 		this.dbModel.getContentsBykey(title)
				, "pro_id": 	proId
			} ); 
            this.chooseFilterView.render();
			*/
        addFilter: function(ev) {
            //var data = ev.originalEvent.dataTransfer.getData("text/plain");
            var data=sessionStorage.dragContent;
            this.$("#filter_body").append(
                this.filterContentTem( {"content": data} )
            );

            //this.filterModel.save();
        },

		ensureFilter: function(data) {
            var title=data.property;
            rmmodel = _.find(this.filterBoxView.collection.models, function(model){
                    return model.get("property")==title; 
            });
            if(rmmodel)
                this.filterBoxView.collection.remove(rmmodel);
			this.filterBoxView.collection.add(data);
		}
    });

    return DesignPanelView;
});

