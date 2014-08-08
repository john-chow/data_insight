define([
"text!region/switch/template/region_switch.html", 
"text!region/switch/template/region_switchs.html", 
], function (switchRegionTemplate, switchsRegionTemplate) {
	var SwitchView = DataInsightManager.module("SwitchRegion",
		    function(SwitchRegion, DataInsightManager, Backbone, Marionette, $, _){
		
		SwitchRegion.Area = Marionette.ItemView.extend({
			template: switchRegionTemplate,
			tagName: "span",
			className: "workbook",
			onShow: function(){
				var self = this;
				$(".selected-workbook").removeClass("selected-workbook");
				this.$el.addClass("selected-workbook");
				//监听切换工作区
				this.$el.on("click", function(){
					if($(this).hasClass("selected-workbook")) return;
					$(".selected-workbook").removeClass("selected-workbook");
					$(this).addClass("selected-workbook");
					//通知controller去切换工作区
					self.trigger("area:switch", self.$el.index());
				});
			}
			
		});
		
		SwitchRegion.Areas = Marionette.CompositeView.extend({
			childView: SwitchRegion.Area,
			tagName: "span",
			template: switchsRegionTemplate,
			childViewContainer: ".workbooks",
			events: {
				"click .new-workbook" : "newWorkBook"
			},
			newWorkBook: function(){
				this.trigger("switch:new");
			}
		})
		
	});
	return SwitchView;
})