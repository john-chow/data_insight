define([
"backbone"
, "model/vtron_model"
, "common/tools"
, "underscore"
], function(Backbone, VtronModel, _t, _) {

	/*
		数据格式:  只有一对key-value
		其中，key是本model的id ['column', 'row']
		value是属性值列表 []
	*/
	var AxesModel 	= VtronModel.extend({
		urlRoot: 		"axes/"
	});
	

	var AxesView = Backbone.View.extend({

		name:		"",				// [column, row]
		tagName:	"div",
		className:	"dragging-custom design-column clearfix",
		templateFun: _.template(
			"<div class='test'><%= label %></div>" 	+
			"<ul id='<%= name %>_sortable' ondragover='return false' class='connectedSortable clearfix'></ul>"
		),

		events: {
			"click .coordinate-filter"          :"coordinateFilter",
			"mouseenter .coordinate-measure"    :"coordinateMeasureShow",
			"mouseleave .coordinate-measure"    :"coordinateMeasureHide",
			"click .coordinate-remove"          :"coordinateRemove",
			"mouseleave .coordinate-measure ul" :"coordinateMeasureUlHide",
			"mouseenter .coordinate-measure ul" :"coordinateMeasureBackground",
			"click .coordinate-max"             :"coordinateMax",
			"click .coordinate-min"             :"coordinateMin",
			"click .coordinate-count"           :"coordinateCount",
			"click .coordinate-sum"             :"coordinateSum",
			"click .coordinate-avg"             :"coordinateAvg",
			"click .coordinate-edit"            :"coordinateEdit",

		},
		
		initialize: function(opt) {
			this.name 			= opt.name;
			this.sortObjId		= "#" + this.name + "_sortable";

			this.model = new AxesModel();
			this.listenTo(this.model, 'change:'+this.name, this.passToTotal);
            Backbone.Events.on("axis:restore_" + this.name, _.bind(this.restore, this));
			this.render();
		},

		render: function() {
			var label = ('x' === this.name) ? '横轴' : '纵轴';
			this.$el.html( this.templateFun({
					'name':		this.name
					, 'label':	label
				})	
			);

			this.setDragProperty();
		},

        restore: function(dataList) {
            var self = this;
            $.each(dataList, function(i, one) {
                // 恢复属性，显示在轴上面
                self.$el.find("#" + self.name + "_sortable").append(one.item);

                // 恢复运算值
                switch(one.cmd) {
                    case "sum":     
                        $(one.item).find(".coordinate-sum").click();   break
                    case "avg":
                        $(one.item).find(".coordinate-avg").click();   break
                    default:    break
                }
            })

            this.$el.append(data.item);
        },


		/*showMenuB: function(ev) {
			$(ev.target).find("b").show();
		},

		hideMenuB: function(ev) {
			$(ev.target).find("b").hide();
		},*/

		coordinateFilter: function(ev) {
			var title = $(ev.target).parents(".coordinate").find(".attr").html();
			var pro_id = $(ev.target).parents(".coordinate").attr("db-data");
			data = {
				"pro_id": 		pro_id
				, "content": 	title
			};
			Backbone.Events.trigger("modal:show_filter",data)
			//Backbone.Events.trigger("modal:show_filter",data);
		},

		coordinateMeasureShow: function(ev) {
			$(ev.target).siblings("ul").show();
		},

		coordinateMeasureHide: function(ev) {
			$(ev.target).siblings("ul").hide();
		},

		coordinateMeasureUlHide: function(ev) {
			if($(ev.target).hasClass("dropdown-menu"))
				$(ev.target).hide();
			else
				$(ev.target).parent().parent().hide();
			$(ev.target).parents(".coordinate-measure").children("a").css("background-color","transparent");
		},

		coordinateRemove: function(ev) {
			var $attrObj = $(ev.target).parents(".coordinate");
			var attrDict = this.makeAttrData($attrObj);
			$attrObj.remove();
			
			var attrList = this.model.get(this.name);
			var newAttrList = Delete_from_array(attrList, attrDict);
			this.model.set(this.name, newAttrList);
		},

		coordinateMeasureBackground: function(ev) {
			$(ev.target).parents(".coordinate-measure").children("a").css("background-color","#e8e8e8");
		},

		coordinateMathSet: function(self) {
        	var list = self.$(self.sortObjId).find(".mension, .measure");
        	var tm = [];
			$.each(list, function(i, x) {
				var attrDict = self.makeAttrData($(x));
				tm.push(attrDict)
			})
			self.model.set(self.name, tm);
        },

		coordinateMax: function(ev) {
			$(ev.target).parents(".coordinate").find(".axes-math").html("(最大值)");
			$(ev.target).parents(".coordinate").find(".axes-math").attr("data","max");
			this.coordinateMathSet(this);
		},

		coordinateMin: function(ev) {
			$(ev.target).parents(".coordinate").find(".axes-math").html("(最小值)");
			$(ev.target).parents(".coordinate").find(".axes-math").attr("data","min");
			this.coordinateMathSet(this);
		},

		coordinateCount: function(ev) {
			$(ev.target).parents(".coordinate").find(".axes-math").html("(计数)");
			$(ev.target).parents(".coordinate").find(".axes-math").attr("data","count");
			this.coordinateMathSet(this);
		},

		coordinateSum: function(ev) {
			$(ev.target).parents(".coordinate").find(".axes-math").html("(求和)");
			$(ev.target).parents(".coordinate").find(".axes-math").attr("data","sum");
			this.coordinateMathSet(this);
		},

		coordinateAvg: function(ev) {
			$(ev.target).parents(".coordinate").find(".axes-math").html("(平均)");
			$(ev.target).parents(".coordinate").find(".axes-math").attr("data","avg");
			this.coordinateMathSet(this);
		},

		coordinateEdit: function(ev) {

		},


      /*  showClose: function(ev) {
            $(ev.target).append("<button type='button' class='plots_close'>&times;</button>");
        },

        hideClose: function(ev) {
            $(ev.target).find("button").remove();
        },

        hideCloseByOut: function(ev) {
            $(ev.target).remove();
        },

        rmAttr: function(ev) {

			var attr = $(ev.target).siblings('.attr').html();
            $(ev.target).parent().remove();
			

			var $attrObj = $(ev.target).parent();
			var attrDict = this.makeAttrData($attrObj);
			$attrObj.remove();
			
			var attrList = this.model.get(this.name);
			var newAttrList = Delete_from_array(attrList, attrDict);
			this.model.set(this.name, newAttrList);
        },*/

		afterSort: function(ev, ui) {
			// 这里从html页面上找寻属性顺序，原则上不合理，有待修改
			this.coordinateMathSet(this);
		},

		makeAttrData: function($attrObj) {	
			var kind = ( "mension" == $attrObj.attr("type") ? 1 : 0 );
			var cmd = $attrObj.find(".axes-math").attr("data");
			var cmd =(cmd=="")?"rgl":cmd;
            var table = $attrObj.attr("table");
			return {
				"attr": 	$attrObj.find(".attr").html()
				, "kind": 	kind
				, "cmd": 	cmd
				, "table": 	table
			}
		},

		setDragProperty: function() {
			//设置可自动排序
			var self = this;

			this.$(this.sortObjId).sortable({
				connectWith: ".connectedSortable",
				//revert: true,
				zIndex: "3000",
				//placeholder: "ui-state-highlight",
				cursor: "default",
				//所有的回调函数接受两个参数: 浏览器事件和ui对象
				start: function(event,ui) { //这个事件在排序开始时触发
					self.$(".dragging-custom").addClass("dragging-change-border");
					sessionStorage.dragContent=$(this).find("li").html();//把数据放在session 
				},
				sort: function(event,ui) {  //这个事件在排序时触发
				},
				change: function(event,ui) { //这个事件在排序时触发,但是仅仅在对象在DOM中的位置改变时才会触发.
				},
				beforeStop: function(event,ui) {  //这个事件在排序停止时触犯,但仅仅在placeholder/helper依然存在时触发.
				},
				stop: function(event,ui) { //这个事件在排序停止时触发.
				},
				update: function(event,ui) { //这个事件在用户停止排序并且DOM节点位置发生改变时出发.
					self.$(".dragging-custom").removeClass("dragging-change-border");
					self.afterSort(event, ui)
				},
				receive: function(event,ui) { //这个时间在一个已连接的sortable接收到来自另一个列表的元素时触发.
				},
				remove: function(event,ui) { //这个事件在sortable中的元素移除自身列表添加到另一个列表时触发.
				},
				over: function(event,ui) { //这个事件在一个元素添加到连接列表中时触发.
				},
				out: function(event,ui) { //这个事件在一个元素移除连接列表时触发.
				},
				activate: function(event,ui) { //这个事件发生在使用连接列表,每个连接列表在拖动开始准备接受它时触发.
				},
				deactivate: function(event,ui) { //这个事件发生在排序结束后,传播到所有可能的连接列表.
				}
			}).disableSelection()
		},


		passToTotal: function() {
			this.model.myPass()
		}	

	});

	return AxesView
})
