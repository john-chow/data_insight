(function($){
	$("#theme_list li").draggable({
		connectToSortable: "#draw_theme",
		scroll: "false",
		helper: function( event ) {
					return $( "<div class='theme-draggable'>"+ $(this).html()+"</div>" );
				},
		start: function(event,ui) {
			$("#scene_design_right").css("border", "2px solid #666");
		},
		stop: function(event,ui) {
			$("#scene_design_right").css("border", "0");
		}
	});
	$( "#draw_theme" ).droppable({
		drop: function( event, ui ) {
			var $self = $(this);
			var imgSrc = ui.helper.find("img").attr("src");
			var scenceId = ui.helper.find("img").data("id");
			var scenceName = ui.helper.find("img").data("name");
            $("<li data-orderId='" + scenceId + "'><img width= '30' height='30' src='"+ ui.helper.find("img").attr("src")+"'/>" + scenceName + "<a class='scene-remove'>"+ 
            	"&times;</a></li>").prependTo($("#play_order"));
            $("<figure class='slide' id='s_" + scenceId + "'><h5 class='scence-title'>" + scenceName +"</h5><img src='" + imgSrc + "'></figure>").prependTo($self);
            var count = $("#scenceCount").data("count") + 1;
            $("#scenceCount").html(count);
            $("#scenceCount").data("count", count);
            //如果添加上去的场景多于1个的时候，则可以进行播放和保存
            if(count > 1 && !$('#time-indicator').is(":animated")){
            	$("#play").removeAttr("disabled");
            	$("#save_scene").removeAttr("disabled");
            }
		}
	})
	/*$("#draw_theme").sortable({
      revert: true,
      stop: function(event, ui) {
            var imgSrc = ui.item.find("img").attr("src");
            $("#play_order").append($("<li>"+ui.item.html()+"<i class='glyphicon scene-remove glyphicon-remove'>"+ 
            	"</i></li>"));
            var image = new Image();
            image.src = imgSrc;
            ui.item.find("img").height(300);
            ui.item.find("img").width(500);

        }
    });*/
    //播放顺序拉拽
    $("#play_order").sortable({
    	stop : function( event, ui ) {
			var sId = ui.item.data("orderid");
			var moveIndex = ui.item.index();
			var $selectObj = $("#s_" + sId);
			if(moveIndex == $("#draw_theme .slide").last().index()){
				$selectObj.appendTo($("#draw_theme"));
			}else if(moveIndex == 0){
				$selectObj.prependTo($("#draw_theme"));
			}else{
				$selectObj.insertAfter("#draw_theme .slide:eq(" + (moveIndex - 1) + ")");
			}
		}
    });
    
     $("#play_order").on("mouseover", "li",function(){
	       		$(this).children(".scene-remove").show();
	       })
       $("#play_order").on("mouseleave", "li",function(){
       		$(this).children(".scene-remove").hide();
       })
        $("#play_order").on("click", "li .scene-remove",function(){
        	var sId = $(this).parent().data("orderid");
        	$("#s_" + sId).remove();
       		$(this).parent().remove();
       		var count = $("#scenceCount").data("count") - 1;
            $("#scenceCount").html(count);
            $("#scenceCount").data("count", count);
            if(count <= 1){
            	$("#save_scene").attr("disabled","disabled");
            	$("#pause").attr("disabled","disabled");
            	$("#stop").click();
            	$("#stop").attr("disabled","disabled");
            	$("#play").attr("disabled","disabled");
            }
       })
})(jQuery)