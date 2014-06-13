(function($){
    $.fn.toolbar = function(options) {    
      var defaults = {    
        position: 'absolute',    
        top: '',
        left: '',
        bottom: '',
        right: '',
        isFixed: true,
        cls : "",
      };        
      var opts = $.extend(defaults, options); 
      var $el = $(this); 
      $el.css({
        top: opts.top,
        left: opts.left,
        right:opts.right,
        bottom: opts.bottom,
        position: opts.position
      });        
      if(!opts.isFixed){
        $el.draggable({
          scroll: "false"
        });
      }
      if(!opts.cls){
        $el.addClass(opts.cls);
      }
     
    };    
})(jQuery)
