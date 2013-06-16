var $thumbs = $([]);

$("#impress").on("impress:init" , function(){
 init()
});

var init = function(){
  $(function(){
    $("#timeline").prepend('<div id="dragbar"></div><div id="thumbs"></>');

    $('#dragbar').on("mousedown.dragbar",function(e){
      e.preventDefault();
      var $document = $(document)

      $document.on('mouseup.dragbar',function(e){
        setTimeout(function(){
          resizeThumbs();
        },100)
        
        $document.off('mousemove.dragbar');
        $document.off('mouseup.dragbar');
      });
     
      
      $document.on('mousemove.dragbar',function(e){
        var newWidth = $document.innerWidth() - e.clientX;

        //return if too big or too small
        if(newWidth > 500 || newWidth < 100) return;

        $('#timeline').css("width",newWidth);
      })
    });
    
    //choose all elements except from overview
    var $steps = $('.step:not(#overview)');

    $steps.each(function(){
     $thumbs = $thumbs.add(createThumb($(this)))
    })

    $thumbs.each( function(index){
      var $this = $(this);
      $("#timeline #thumbs").append($this)
      $this
        .wrap('<div class="thumb"></div>')
      this.style["-webkit-transform-origin"] = "0 0";
       $this.parent()
        .css("background", $('body').css('background'));
    })

    resizeThumbs();

    $("#thumbs").sortable({
      stop: function(event, ui)
      {
        var $thumbStep = $(ui.item).find('.thumbstep')
        console.log( $thumbStep.data('references'))
        console.log($(ui.item))
        console.log( $(ui.item).prev())//.find('.thumbstep').data('references'))
        $("#"+ $thumbStep.data('references')).insertAfter("#" + $(ui.item).prev().find('.thumbstep').data('references'));
      }
    })

  });
  
}

var resizeThumbs = function(){
  var $thumb = $("#timeline .thumb").eq(0);
  var outerWidth =  parseInt($thumb.css("padding-left").replace("px", "")) + parseInt($thumb.css("padding-right").replace("px", ""));
  outerWidth +=  parseInt($thumb.css("margin-left").replace("px", "")) + parseInt($thumb.css("margin-right").replace("px", ""))
  outerWidth +=  parseInt($thumb.css("border-left-width").replace("px", "")) + parseInt($thumb.css("border-right-width").replace("px", ""));
  var thumbContentWidth = $("#timeline").innerWidth() - (outerWidth);

  $thumbs.each( function(index){
    var $this = $(this)
    , scaleFactor =  thumbContentWidth / $this.outerWidth();

    this.style["-webkit-transform"] = "scale("+scaleFactor+")";
    $this.parent()
      .css({
        "width"  : parseInt($this.outerWidth() * scaleFactor) + "px",
        "height" : parseInt($this.outerHeight() * scaleFactor) + "px" 
      });
  });
}


/** @function createThumb
*   @description: creates a clone of the original element,
*   appends '-thumb' to the original id and removes any
*   classes for the cloned element and its children
*   it also add a data-references attribute to the referenced
*   step
*/
var createThumb = function($orig){
  var $clone = $orig.clone();

  $clone
    //change id only if not empty
    .attr("id", ($(this).attr("id")== undefined || $(this).attr("id")== '') ? '' : $(this).attr("id") + "-thumb")
    .attr("class","thumbstep")
    //copy original computed style
    .css(css($orig))
    //add reference to original slide
    .data('references', $orig.attr('id'))

  var $cloneChildren = $clone.find('*');
  //copy original computed style for children
  $orig.find('*').each(function(index){

    $cloneChildren.eq(index)
      //change id only if not empty
      .attr("id", ($(this).attr("id")== undefined || $(this).attr("id")== '') ? '' : $(this).attr("id") + "-thumb")
      .attr("class", "")
      //copy original computed style
      .css(css($(this)));
  });

  return $clone

}

var css = function(a){
    var o = {};
    var rules = window.getComputedStyle(a.get(0));
     o = $.extend(o, css2json(rules));
    // for(var r in rules) {
    //     o = $.extend(o, css2json(rules[r]), css2json(a.attr('style')));
    // }
    return o;
}
var css2json = function(css){
    var s = {};
    if(!css) return s;
    if(css instanceof CSSStyleDeclaration) {
        for(var i in css) {
          if(!css[i]) {break;}
            if((css[i]).toLowerCase) {
                s[(css[i]).toLowerCase()] = (css[css[i]]);
            }
        }
    } 
    else if(typeof css == "string") {
        css = css.split("; ");          
        for (var i in css) {
            var l = css[i].split(": ");
            s[l[0].toLowerCase()] = (l[1]);
        };
    }
    return s;
}
