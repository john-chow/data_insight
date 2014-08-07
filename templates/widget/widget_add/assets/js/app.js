/*!
 * 配置marionette
 * Date: 2014-7-25
 */
define([
	'jquery',
	'jquery-ui',
	'json2',
	'underscore',
	'backbone',
	'marionette',
	'common/dialog',
	'region/table/route',
	'region/field/route',
	"region/design/route",
	"region/show/route",
	"csrf",
	'tool',
	'minicolors'
], function ($, JqueryUi, json, _, backbone, Marionette, dialog, tableRoute, fieldRoute, Minicolors) {

	DataInsightManager.addRegions({
	      operateRegion: 			"#operate_region",	//操作栏区域
	      tableRegion: 				"#table_region",	//数据表区域
	      fieldRegion: 				"#field_region",	//数据区域
	      designRegion: 			"#design_region",	//设计区域
	      showRegion: 				"#show_region",		//显示区域
	      switchRegion: 			"#switch_region",	//切换区域

	      //公用部分：模态框
	      dialogRegion: Marionette.Region.Dialog.extend({
	      	el: "#dialog_region"
  		  })	
	});

	return DataInsightManager;
});

