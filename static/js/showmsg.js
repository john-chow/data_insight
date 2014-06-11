(function($$){
    $$.fn.showmsg = function(options) {    
      var defaults = {    
        msg: '',    
        top: '0px',
        left: '0px',
        delayTime: 1000,
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
      var showMes = function(){
        $$(".show-msg").hide();
      }
      setTimeout(showMes ,opts.delayTime);  
    };    
})(jQuery)
