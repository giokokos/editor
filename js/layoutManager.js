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

    this.setAlignIcons();
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
      that.alignRow();
    })
    .on('click', '.grid-holder', function(event) {
      event.preventDefault();
      that.setGrid();
    })
    .on('click', '.circle-holder', function(event) {
      event.preventDefault();
      that.setCircle();
    });
  }


  // var defaults={
  //   margin:{
  //     x : 500,
  //     y : 500,
  //   },
  //   gridSize : {
  //     columns : 5,
  //     x       : 1500,
  //     y       : 1500
  //   }
  // }

  //var settings = $.extend({}, defaults, options)


  LayoutManager.prototype.alignRow = function(){
    // do stuff
    console.log("I will align row this selection")
    console.log(this.selection)
  }

  LayoutManager.prototype.setGrid = function () {
    this.selection.setLayout({
      layout:'grid'
    });

    // var offSetX = 0//this[0].data.x
    //   , offSetY = 0;//this[0].data.y;
    //   $.each(this, function(index, obj){
    //     //console.log(obj)
    //     obj[0].data.x = offSetX +  ((index % defaults.gridSize.columns) * defaults.gridSize.x); 
    //     obj[0].data.y = offSetY + ((Math.floor(index / defaults.gridSize.columns)) * defaults.gridSize.y);   
 
    //     //update node actual properties
    //     obj[0].$node[0].dataset.x = obj[0].data.x;
    //     obj[0].$node[0].dataset.y = obj[0].data.y;
    //     obj[0].$node[0].dataset.rotate = obj[0].data.rotate;
    //     obj[0].$node[0].dataset.scale = obj[0].data.scale;

    //      //redraw element with external function
    //     config.redrawFunction(obj[0].$node[0]);
    //   });

  }

  LayoutManager.prototype.setCircle = function () {
    this.selection.setLayout({
      layout:'circle'
    });
  }


  this.init();


};



