define([
"backbone"
], function(Backbone) {

	var DB_INFO_BAR_MODEL = null;

    var DbinfoBarModel = Backbone.Model.extend({
        simulateData: function() {
            var dbInfo = {
                name: "Coffee chain (Access)",
                dm: {
                    "Area Code":    [201, 203, 205, 234234, 324234, 2343, 3434, 2342, 1, 3, 34, 34, 22, 11, 55, 444, 333, 123, 1, 5],
                    "Date":         ["2014-03-05", "2014-01-04","2014-01-06","2014-01-07","2014-01-08","2014-04-04","2014-03-04"],
                    "Market Size":  ["small", "media", "large"],
                    "Product":      ["A", "B", "C"],
                    "Product Line": [],
                    "State":        [],
                    "Type":         []
                },
                me: {
                    "Inventory":        null,
                    "Margin":           null,
                    "Marketing":        null, 
                    "Profit":           null,
                    "Sales":            null,
                    "Total Expense":    null,
                    "Budget COCS":      null,
                    "Budget Margin":    null,
                    "Budget Profit":    null,
                    "Budget Sales":     null
                }
                
            };

            this.set(dbInfo);
        },

        getContentsBykey: function(key) {
            var dmFounded = this.get("dm")[key];
            if(dmFounded) {
                return dmFounded
            }

            var meFounded = this.get("me")[key];
            if(meFounded) {
                return meFounded
            }
        }
    });

	return {
		getInstance: function() {
            if(!DB_INFO_BAR_MODEL) {
                DB_INFO_BAR_MODEL = new DbinfoBarModel();
                return DB_INFO_BAR_MODEL
            }
            return DB_INFO_BAR_MODEL
        }
	}
})
