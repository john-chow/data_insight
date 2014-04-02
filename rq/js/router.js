define([
 'model/dbinfo'     
], function(DbBarModel) {

    var MainRouter = Backbone.Router.extend({
        routes: {
			":dbname/":         'test'
			, '*default': 		'elseDo'
        },

        test: function(dbname, qs) {
            //alert("11111111")
        },
	
		elseDo: function(e) {
			alert("aaaaaaaa")
		}
    });

    return MainRouter
})
