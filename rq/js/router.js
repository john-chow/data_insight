define([
 'model/dbinfo'     
], function(DbBarModel) {

    var MainRouter = Backbone.Router.extend({
        routes: {
            "view":          	'test'
			, '*default': 		'elseDo'
        },

        test: function() {
            alert("11111111")
        },
	
		elseDo: function() {
			alert("aaaaaaaa")
		}
    });

    return MainRouter
})
