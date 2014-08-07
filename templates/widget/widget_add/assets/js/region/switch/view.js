define([
"text!region/switch/template/region_switch.html", 
], function (switchRegionTemplate) {
	var SwitchView = DataInsightManager.module("SwitchRegion",
		    function(SwitchRegion, DataInsightManager, Backbone, Marionette, $, _){
		
		SwitchRegion.Area = Marionette.ItemView.extend({
			template: switchRegionTemplate,
			tagName: "span",
			className: "workbook",
			onshow: function(){
				//监听切换工作区
				this.$el.on("click", function(){
					//通知controller去切换工作区
					SwitchRegion.Controller.trigger("area:switch", this.$el.index());
				})
			}
			
		});
		
		SwitchRegion.Areas = Marionette.CollectionView.extend({
			childView: SwitchRegion.Area
		})
		
	});
	return SwitchView;
})