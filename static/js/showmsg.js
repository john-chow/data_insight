(function($$){
    $$.fn.showmsg = function(options) {    
      var defaults = {    
        msg: '',    
        top: '0px',
        left: '0px',
        delayTime: 1000,
        type: 'success',
        cls : "alert-success",
      };    
      // Extend our default options with those provided.    
      var opts = $$.extend(defaults, options);    
      // Our plugin implementation code goes here. 
      var el = this;
      $$(el).show();
      $$(el).css({top: opts.top, left: opts.left});
      $$(el).text(opts.msg);
      $$(el).addClass(opts.cls);
      if(opts.type == 'success'){
    	  $$(el).removeClass("alert-danger");
    	  $$(el).removeClass("alert-warning");
    	  $$(el).addClass("alert-success");
      }else if(opts.type == 'danger'){
    	  $$(el).removeClass("alert-success");
    	  $$(el).removeClass("alert-warning");
    	  $$(el).addClass("alert-danger");
      }else if(opts.type == 'warning'){
    	  $$(el).removeClass("alert-danger");
    	  $$(el).removeClass("alert-success");
    	  $$(el).addClass("alert-warning");
      }
      var showMes = function(){
    	  $$(el).hide();
      }
      setTimeout(showMes ,opts.delayTime);  
    };    
})(jQuery)
