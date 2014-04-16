define([
	'backbone'
	, "choose_filter"
], function(Backbone, ChooseFilterView) {

	var idToViewMap = {
	};

	Backbone.Events.on("modal:show_filter", function(data) {
		var id = data["pro_id"];
		var title = data["content"];
		var view = idToViewMap[id];
		if (!view) {
			view = new ChooseFilterView();
			Backbone.Events.once("modal:filter_data", function(data) {
				view.model.set( {
					"title":		title
					, "fil": 		data
				} ); 
				view.render();
				idToViewMap[id] = view
			});
			Backbone.Events.trigger("dbinfo:model_data", title)
		}
		else {
			view.show()
		}
	});



})


