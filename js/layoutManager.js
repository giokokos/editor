$(function(){

  var alignment = {
      horizontal : '' ,
      vertical : ''
    }
  , $rowIcon = $('.alignment-row').find('a')
  , $columnIcon = $('.alignment-column').find('a')
  , icons = {

      horizontal : {
        left : "layout/img/AlignColumnLeft.png",
        center: "layout/img/AlignColumnCenter.png",
        right: "layout/img/AlignColumnRight.png",
      },

      vertical : {
        top : "layout/img/AlignRowTop.png",
        center: "layout/img/AlignRowCenter.png",
        bottom: "layout/img/AlignRowBottom.png",
      }
     
  }

  function init(){
    alignment.horizontal = "center";
    alignment.vertical = "center";
    onAlignmentCircleClick($('center-center'))
  }

  // update align icons
  function setAlignIcons() {
    console.log($columnIcon)
    $columnIcon.css( 'background-image', 'url("'+ icons.horizontal[alignment.horizontal] +'")' );
      console.log($columnIcon.css('background-image'))
    $rowIcon.css( 'background-image', 'url("'+ icons.vertical[alignment.vertical] +'")' );
  }

  // update alignment data
  function onAlignmentCircleClick($target){

    $('.circle-dot').removeClass('active');
    $target.addClass('active');

    //store alignment setting
    alignment.horizontal = $target.data("horizontal"),
    alignment.vertical = $target.data("vertical")

    setAlignIcons()
  }

  // mouse and keyboard listeners
  $(document)
    .on('click',".circle-dot", function(event){
      event.preventDefault();
      onAlignmentCircleClick($(event.target));
    })
    .on('keyup', "input", function(event){
      var value = $(this).val();
    })
    .on('mousedown',".icon-holder a", function(event){
      event.preventDefault();
      $(event.target)
        .css("opacity", 0.7)
        .parent().css("opacity", 0.7)
    })
    .on('mouseup',".icon-holder a", function(event){
      event.preventDefault();
      $(event.target)
        .css("opacity", 1)
        .parent().css("opacity", 1)
    })
    .on('mouseout',".icon-holder a", function(event){
      event.preventDefault();
      $(event.target)
        .css("opacity", 1)
        .parent().css("opacity", 1)
    })
    .on('mousedown mousewheel', '.sidebar', function(event) {
      event.stopPropagation(); // prevent all the handlers of viewport
    });


})
