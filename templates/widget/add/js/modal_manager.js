define([
	'vtron_events'
	, "choose_filter"
], function(VtronEvents, ChooseFilterView) {

	var idToViewMap = {
	};


	VtronEvents.onOut("modal:show_filter", function(data) {
		var sheetId = data["sheetId"];
		var id 		= data["pro_id"];
		var title 	= data["content"];
		var view 	= idToViewMap[id];
		if (!view) {
			view = new ChooseFilterView();
			/*
			VtronEvents.once("modal:filter_data", function(data) {
				view.model.set( {
					"title":		title
					, "fil": 		data
					,"pro_id":      id
				} ); 
				view.render();
				idToViewMap[id] = view
			});
			*/

			var renderFilter = function() {
				var tmpView 	= view;
				var tmpTitle 	= title;
				var tmpId 		= id
				var f = function(data) {
					tmpView.model.set( {
						"title":		tmpTitle
						, "fil": 		data
						, "pro_id":     tmpId
					} ); 
					tmpView.render();
				};

				return f
			}

			VtronEvents.triggerOut(sheetId + "dbinfo:model_data", {
				"title": title, "callback": renderFilter()
			})
			idToViewMap[id] = view
		}
		else {
			view.show()
		}
	});

})


