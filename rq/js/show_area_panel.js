define([
"backbone"
, "base_sheet"
, "bootstrap"
, "gridster"
, "info_workplace"
, "text!../template/show_area_panel.html" 
], function(Backbone, BaseSheetView, b, g, infoWorkplaceView
			, showAreaPanelHtml) {

    var showAreaPanelView = BaseSheetView.extend({

        tagName:            "div",
        id:                 "show_area_panel",

        events: {
         
        },

        initialize: function() {
           //this.infoWorkplaceView = new infoWorkplaceView();
           this.render();
           this.addWidget();
           this.openWorkBook();
           this.saveWorkBook();
        },

        render: function() {
            this.$el.html(showAreaPanelHtml);
            //this.$el.append(this.infoWorkplaceView.el);
        },

        addWidget: function() {
			var self = this;
            this.onOut("gridster:add", function(data) {
				var newPicObj = $("<li class='gs-w'>"+data+"</li>");
				self.reDrawCanvas(newPicObj);
                var gridster = $(".gridster ul").gridster().data('gridster');//获取对象
                gridster.add_widget(jquery_to_html(newPicObj), 2, 1);//增加一个

                //gridster.add_widget("<li class='gs-w'><div>"+data+"</div></li>", 2, 1);//增加一个
            });
        },

        openWorkBook: function() {
            Backbone.Events.on("work_book:open", function(data) {
                //测试，数据暂时先保存到seesion
                var serialization=sessionStorage.tempWorkBook;
                var dataArray=sessionStorage.dataArray.split(",");
                gridster.remove_all_widgets();
                $.each(JSON.parse(serialization), function(i) {
                    var st="<li class='gs-w'><div>"+dataArray[i]+"</div></li>";
                    gridster.add_widget(st, this.size_x, this.size_y, this.col, this.row);
                });
            });
        },

        saveWorkBook: function() {
            Backbone.Events.on("work_book:save", function(data) {
                //测试，数据暂时先保存到seesion，以后要发到服务器
                //PS:保存和打开服务器数据时，最好有一个阴影层，提示保存中/加载中

                //保存坐标
                var gridster = $(".gridster ul").gridster().data('gridster');//获取对象
                var seria = gridster.serialize();
                sessionStorage.tempWorkBook = JSON.stringify(seria);

                //保存数据
                var dataArray = new Array();
                $(".gridster ul li").each(function(i){
                    dataArray[i] = $(this).find("div").html();
                });
                sessionStorage.dataArray = dataArray;
                alert("保存成功！");

            });
        },

		reDrawCanvas: function($obj) {
			$.map( $obj.find("canvas"), function(cvs) {
				$(cvs).replaceWith( clone_canvas(cvs) )
			} )
		}

    });

    return showAreaPanelView;
})



