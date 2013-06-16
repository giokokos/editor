$("#impress").on("impress:init" , function(){
  init()
});

var init = function(){
  $(function(){
    $("#timeline")
      .css('width', "230px")
      .css('overflow-x', "hidden")
      .css('overflow-y', "scroll")


    var extCSS = [];
    var $steps = $('.step');

    deepCopyStyles($steps.eq(3))

    var thumbs = [];
    $steps.each(function(){
     thumbs.push(deepCopyStyles($(this)))
    })


    // var $thumbs = $steps.clone();
    
    $.each(thumbs, function(index){
      $("#timeline").append($(this))
      $(this)
        .attr("id", $(this).attr("id") + "-thumb")
        //.removeClass('step')
        //.attr('style', "")
        .wrap('<div style="position:relative; background:white; border:2px solid white; margin: 5px;"></div>')

     // $(this).css(extCSS[index]);
      var scaleFactor =  180 / $steps.eq(index).width();
      //console.log("scaleFactor: " + scaleFactor)
     this.style["-webkit-transform"] = "scale("+scaleFactor+")";
      this.style["-webkit-transform-origin"] = "0 0";
       $(this).parent().css("background", $('body').css('background'));
       $(this).parent().css("padding",  "10px"  )
      $(this).parent().css("width",  parseInt($steps.eq(index).width() * scaleFactor) + "px"  )
      $(this).parent().css("height",  parseInt($steps.eq(index).height() * scaleFactor) + "px" )

      //console.log($(this).css('transform'))
    })
    
     //$("#timeline .step").wrap('<div style="position:relative; border:2px solid white; margin: 5px;"></div>');

    // for (var i=0; i<=10; i++){
    //   $("#timeline").append('<div style="width:200px; height:160px; border:2px solid white; margin: 5px;"></div>');
    // }
  });
  
}

function deepCopyStyles($orig){
  var $clone = $orig.clone();
  $clone.eq(0).css(css($orig));
  $clone.eq(0).attr("class","")

  var $cloneChildren = $clone.find('*');
  $orig.find('*').each(function(index){
    $cloneChildren.eq(index).attr("class", "")
    $cloneChildren.eq(index).css(css($(this)));
  });

  return $clone[0]

}

function css(a){
    var o = {};
    var rules = window.getComputedStyle(a.get(0));
     o = $.extend(o, css2json(rules));
    // for(var r in rules) {
    //     o = $.extend(o, css2json(rules[r]), css2json(a.attr('style')));
    // }
    return o;
}
function css2json(css){
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
