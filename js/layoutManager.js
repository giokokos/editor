// since this works with selectors this object must be called
// after the dom has loaded

function LayoutManager ($){

  var alignment = {
      horizontal : '' ,
      vertical : ''
    };

  // the objects that holds the html nodes to align
  this.selection = [];

  var $rowIcon = $('.alignment-row').find('a')
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

  LayoutManager.prototype.setSelection = function(selection){
    if(!(selection instanceof Array)){
      throw new Error("layoutManager.js: selection should be an array")
    }

    this.selection = selection;
  }

  LayoutManager.prototype.init = function(){
    alignment.horizontal = "center";
    alignment.vertical = "center";
    this.onAlignmentCircleClick($('center-center'))
    this.setUpListeners();
  }

  // update align icons
  LayoutManager.prototype.setAlignIcons = function() {
    $columnIcon.css( 'background-image', 'url("'+ icons.horizontal[alignment.horizontal] +'")' );
    $rowIcon.css( 'background-image', 'url("'+ icons.vertical[alignment.vertical] +'")' );
  }

  // update alignment data
  LayoutManager.prototype.onAlignmentCircleClick = function($target){

    $('.circle-dot').removeClass('active');
    $target.addClass('active');

    //store alignment setting
    alignment.horizontal = $target.data("horizontal"),
    alignment.vertical = $target.data("vertical")

    this.setAlignIcons()
  }

  // mouse and keyboard listeners
  LayoutManager.prototype.setUpListeners = function(){
    var that=this;
    $(document)
    .on('click',".circle-dot", function(event){
      event.preventDefault();
      that.onAlignmentCircleClick($(event.target));
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
    })
    .on('click', '.alignment-row', function(event) {
      that.alignRow()
    });
  }

   LayoutManager.prototype.alignRow = function(){
    // do stuff
    console.log("I will align row this selection")
    console.log(this.selection)
  }


    this.init();
};
