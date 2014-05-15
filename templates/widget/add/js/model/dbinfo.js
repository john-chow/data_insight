define([
	"backbone"
	, "model/vtron_model"
], function(Backbone, VtronModel) {

    var DbinfoBarModel = VtronModel.extend({
		urlRoot: '/indb/content',

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

		// 由于每个attribute对应的value有可能是array，所以要提前做好反序列化
		// 下面实现内容是copy出backbone的源代码，只是修改了options.success
		fetch: function(options) {
			options = options ? _.clone(options) : {};
			if (options.parse === void 0) options.parse = true;
			var model = this;
			var success = options.success;
			backbone_succ = function(resp) {
				if (!model.set(model.parse(resp, options), options)) return false;
				if (success) success(model, resp, options);
				model.trigger('sync', model, resp, options);
			};

			options.success = function(resp) {
				// 反序列化
				$.each( resp['dm'], function(k, v) {
					resp['dm'][k] = JSON.parse(v)
				})
				
				backbone_succ(resp)
			};

			//wrapError(this, options);
			return this.sync('read', this, options);
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
        },

		passTableName: function() {
			var table = this.get("name");
			this.triggerOut( "area:change_table"
							, {"table": table} )
		}
    });

	return DbinfoBarModel
})
