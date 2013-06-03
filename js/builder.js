var builder = (function () {

  'use strict';

  var state = {
    editing: false,
    $node: false,
    data: {
      x: 0,
      y: 0,
      z: 0, //new
      rotate: 0,
      rotateX: 0, //new
      rotateY: 0, //new
      scale: 0
    }
  },
    selection = [],
    config = {
      rotation: 0,
      rotateStep: 1,
      scaleStep: 0.02,
      visualScaling: 10,
      redrawFunction: false,
      setTransformationCallback: false
    },
    defaults = {
      x: 0,
      y: 0,
      z: 0, //new
      rotate: 0,
      scale: 1
    },
    mouse = {
      prevX: false,
      prevY: false,
      activeFunction: false
    },
    handlers = {},
    redrawTimeout,
    //nodes
    $menu, $controls, $overview, $sliders;


  selection.hasstate = function (s) {
    console.log('Checking ' + s.$node.attr('id'));
    for (var i = 0; i < this.length; i++) {
      //console.log(this[i].$node.attr('id'))
      if (this[i].$node.attr('id') === s.$node.attr('id'))
        return true;
    }
    return false;
  }
  selection.pushstate = function (s) {
    //make a deep enough copy
    this.push({
      $node: s.$node,
      data: {
        x: s.data.x,
        y: s.data.y,
        rotate: s.data.rotate,
        scale: s.data.scale
      }
    });
    s.$node[0].classList.add('selected');
  }
  selection.move = function (x, y) {
    for (var i = 0; i < this.length; i++) {
      this[i].data.x = (this[i].data.x) ? (this[i].data.x) + x : x;
      this[i].data.y = (this[i].data.y) ? (this[i].data.y) + y : y;
    }
  }
  selection.scale = function (x) {
        console.log(this.length)
    for (var i = 0; i < this.length; i++) {
      this[i].data.scale -= -x * config.scaleStep * config.visualScaling / 10;
    }
  }
  selection.setScale = function (s) {
    for (var i = 0; i < this.length; i++) {
      this[i].data.scale = s;
    }
  }
  selection.rotate = function (x) {
    for (var i = 0; i < this.length; i++) {
      this[i].data.rotate -= -x * config.rotateStep % 360;
    }
  }
  selection.setRotate = function (r) {
    for (var i = 0; i < this.length; i++) {
      this[i].data.rotate = r;
    }
  }
  selection.setX = function (x) {
    for (var i = 0; i < this.length; i++) {
      this[i].data.x = x;
    }
  }
  selection.setY = function (y) {
    for (var i = 0; i < this.length; i++) {
      this[i].data.y = y;
    }
  }
  selection.clear = function () {
    for (var i = 0; i < this.length; i++) {
      this[i].$node[0].classList.remove('selected');
    }
    this.length = 0;
  }

  /** @function setLayout
  * Sets layout of slides in presentation
  * base on predifined themes
  */
  selection.setLayout = function (options){
    if(!this || this.length == 0){
      console.log("setLayout: empty or null this, aborting");
    }

    var defaults={
      margin:{
        x : 0,
        y : 0,
      },
      gridSize : {
        columns : 5,
        x       : 1500,
        y       : 1500,
      }
    }

    var settings = $.extend({}, defaults, options)
    
    switch (options.layout){
      case 'row':
        //use x and y of first element
        var newX = this[0].data.x
        , newY = this[0].data.y;

        $.each(this, function(index, obj){
          obj.data.x = newX
          obj.data.y = newY;          

          //update node actual properties
          obj.$node[0].dataset.x = obj.data.x;
          obj.$node[0].dataset.y = obj.data.y;
          obj.$node[0].dataset.rotate = obj.data.rotate;
          obj.$node[0].dataset.scale = obj.data.scale;

          //prepare for next iteration
          newX += (obj.$node.eq(0).width() + settings.margin.x);

          //redraw element with external function
          config.redrawFunction(obj.$node[0]);
        })
      break;

      case 'grid':
        //use x and y offsets from first element
        var offSetX = 0//this[0].data.x
        , offSetY = 0;//this[0].data.y;
        $.each(this, function(index, obj){

           console.log({'index': index,
                        'obj.data.x': obj.data.x,
                        'obj.data.y': obj.data.y,


            }) 



          obj.data.x = offSetX +  ((index % settings.gridSize.columns) * settings.gridSize.x); 
          obj.data.y = offSetY + ((Math.floor(index / settings.gridSize.columns)) * settings.gridSize.y);   

          console.log("division: " + (index / settings.gridSize.columns));   
           console.log("after");   
          console.log({'index': index,
                        'obj.data.x': obj.data.x,
                        'obj.data.y': obj.data.y,


            })        

          //update node actual properties
          obj.$node[0].dataset.x = obj.data.x;
          obj.$node[0].dataset.y = obj.data.y;
          obj.$node[0].dataset.rotate = obj.data.rotate;
          obj.$node[0].dataset.scale = obj.data.scale;

           //redraw element with external function
          config.redrawFunction(obj.$node[0]);
        });
      break;
    }
  }

  handlers.move = function (x, y) {
    var v = fixVector(x, y);
    if (selection.length > 1) {
      selection.move(v.x, v.y);
    }
    state.data.x = (state.data.x) ? (state.data.x) + v.x : v.x;
    state.data.y = (state.data.y) ? (state.data.y) + v.y : v.y;

  };
  handlers.scale = function (x) {
    if (selection.length > 1) {
      selection.scale(x);
    }
    state.data.scale -= -x * config.scaleStep * config.visualScaling / 10;
  };
  handlers.rotate = function (x) {
    if (selection.length > 1) {
      selection.rotate(x);
    }
    state.data.rotate -= -x * config.rotateStep % 360;
  };

  //new
  handlers.rotateX=function(x,y){
    var v = fixVector(x, y);

    // selection.length ???
    state.data.rotateX += -v.y * config.rotateStep % 360; // added % 360
    state.data.rotateY += v.x * config.rotateStep % 360;  // added % 360
  };//new

  function init(conf) {
    config = $.extend(config, conf);

    if (config.setTransformationCallback) {
      config.setTransformationCallback(function (x) {
        // guess what, it indicates slide change too :)
        $controls.hide();

        //setting pu movement scale
        config.visualScaling = x.scale;
        //console.log(x.scale);
        //TODO: implement rotation handling for move
        config.rotation = ~~ (x.rotate.z);
        //console.log('rotate',x.rotate.z);
        //I don't see why I should need translation right now, but who knows...
      })
    }

    $('body').addClass('edit');
    $overview = $('#overview');

    // Main controls
    $menu = $('<div class="builder-main"></div>');
    $('<div class="builder-bt"></div>').appendTo($menu).text('Save'); // TODO
    $('<div class="builder-bt"></div>').appendTo($menu).text('Preview'); // TODO
    $('<div class="builder-bt"></div>').appendTo($menu).text('Settings').on('click', openMyModal);
    $('<div class="builder-bt"></div>').appendTo($menu).text('Overview').on('click', function () { config['goto']('overview'); });
    $('<div class="builder-bt bt-delete"></div>').appendTo($menu).text('Delete').on('click', deleteContents);

    // Add slide
    $('<span class="plus"></span>').wrap('<div class="bt-add-slide"></div>').text('+').parent().appendTo('body').on('click', addSlide);

    // Return to presentation 
    $('<span></span>').wrap('<a href="#" class="back-button">◄ </a>').text('Your presentation').parent().appendTo('body').on('click', gotoPresentation);

    // Sliders 
    $sliders = $('<div class="sliders"></div>');
    $('<div class="sliders-button"></div>').appendTo($sliders).text('Controls');
    $('<p>Position</p>').appendTo($sliders);
    $('<span>&rarr;</span>').appendTo($sliders);
    $('<input type="text" class="slidable" step="1" min="-Infinity" max="Infinity" placeholder="X">').attr('id', 'mx').addClass('bt-text').text('Edit').appendTo($sliders);
    $('<span>&uarr;</span>').appendTo($sliders);
    $('<input type="text" class="slidable" step="1" min="-Infinity" max="Infinity" placeholder="Y">').attr('id', 'my').addClass('bt-text').text('Edit').appendTo($sliders);
    $('<span>&darr;</span>').appendTo($sliders);
    $('<input type="text" class="slidable" step="1" min="-Infinity" max="Infinity" placeholder="Z">').attr('id', 'mz').addClass('bt-text').text('Edit').appendTo($sliders);

    $('<p>Scale</p>').appendTo($sliders);
    $('<span>&harr;</span>').appendTo($sliders);
    $('<input type="text" class="slidable" step="0.01" min="-100" max="100" placeholder="S">').attr('id', 'ms').addClass('bt-text').text('Edit').appendTo($sliders);

    $('<p>Rotation</p>').appendTo($sliders);
    $('<span>&crarr;</span>').appendTo($sliders);
    $('<input type="text" class="slidable" step="1" min="-360" max="360" placeholder="R">').attr('id', 'mr').addClass('bt-text').text('Edit').appendTo($sliders);
    $('<span>&rceil;</span>').appendTo($sliders);
    $('<input type="text" class="slidable" step="1" min="-360" max="360" placeholder="Rx">').attr('id', 'mrx').addClass('bt-text').text('Edit').appendTo($sliders);
    $('<span>&lceil;</span>').appendTo($sliders);
    $('<input type="text" class="slidable" step="1" min="-360" max="360" placeholder="Ry">').attr('id', 'mry').addClass('bt-text').text('Edit').appendTo($sliders);

    $menu.appendTo('body');
    $sliders.appendTo('body');

    $controls = $('<div class="builder-controls"></div>').hide();

    $('<div class="bt-delete"></div>').attr('title', 'Delete').click(deleteContents).appendTo($controls);
    $('<div class="bt-move"></div>').attr('title', 'Move').data('func', 'move').appendTo($controls);
    $('<div class="bt-rotate"></div>').attr('title', 'Rotate').data('func', 'rotate').appendTo($controls);
    $('<div class="bt-scale"></div>').attr('title', 'Scale').data('func', 'scale').appendTo($controls);
    $('<div class="bt-rotateX"></div>').attr('title', 'RotateX').data('func', 'rotateX').appendTo($controls);

    // $("#my").attr("value",$(".active").attr("data-y") || 0);
    // $("#mz").attr("value",$(".active").attr("data-z") || 0);

    var showTimer;

    $controls.appendTo('body').on('mousedown', 'div', function (e) {
      e.preventDefault();
      mouse.activeFunction = handlers[$(this).data('func')];
      loadData();
      //console.log('loadata called')
      mouse.prevX = e.pageX;
      mouse.prevY = e.pageY;
      $(document).on('mousemove.handler1', handleMouseMove);
      return false;
    }).on('mouseenter', function () {
      clearTimeout(showTimer);
    });
    $(document).on('mouseup', function () {
      mouse.activeFunction = false;
      $(document).off('mousemove.handler1');
    });


    $('body').on('mouseenter', '.step', function (e) {
      var shift = (e.shiftKey == 1);
      var $t = $(this);
      showTimer = setTimeout(function () {
        if (!mouse.activeFunction) {
          //show controls
          state.$node = $t;
          loadData();
          showControls(state.$node);
          // MULTIPLE SELECTION OF STEPS
          if (shift) {
            if (!selection.hasstate(state)) {
              selection.pushstate(state);
            }
          } else {
            selection.clear();
          }
        }
      }, 500);
      $t.data('showTimer', showTimer);
    }).on('mouseleave', '.step', function () {
      //not showing when not staying
      clearTimeout($(this).data('showTimer'));
    });

    $(window).on('beforeunload', function () {
      return 'All changes will be lost';
    });

    config['goto']('start');

  }

  // PLUGIN
  jQuery.fn.slidingInput = function (opts) {

      var defaults = {
          step: 1, // Increment value
          min: 0, // Minimum value
          max: 100, // Maximum value
          tolerance: 2 // Mouse movement allowed within a simple click
      };

      return this.each(function () {
          var $el = $(this),
              options = $.extend({}, defaults, opts, this),
              distance = 0,
              initialValue = 0;

          function mouseDown() {
              distance = 0;

              // check for integer numbers
              if ($el.val() % 1 === 0) {
                initialValue = parseInt($el.val(), 10);
              }
              else {
                initialValue = parseFloat($el.val());
              }

              updateSync($el);

              $(document).on('mousemove', mouseMove).on('mouseup', mouseUp);

              return false;
          }

          function mouseMove(e) {

              var currentValue;
              if ($el.val() % 1 === 0) {
                currentValue = parseInt($el.val(), 10);
              }
              else {
                currentValue = parseFloat($el.val());
              }

             // var currentValue = parseInt($el.val(), 10),
               var event = e.originalEvent,
                  movementX = event.movementX || event.webkitMovementX || event.mozMovementX || 0,
                  movementY = event.movementY || event.webkitMovementY || event.mozMovementY || 0;              

              distance += (movementX - movementY) * options.step;

              $el.val(Math.min(options.max, Math.max(initialValue + distance, options.min)));

              updateSync($el);

          }

          function mouseUp() {
              $(document).off('mousemove mouseup');

              if (Math.abs(distance) < options.tolerance) {
                  $el.focus();
              }
          }

          $el.on('mousedown', mouseDown);
      });
  };


  function updateSync($el) {

    if($el.attr('id') == 'mx') {

      state.data.x = $el.val();
      selection.setX(state.data.x);
      redraw();
    }
    if ($el.attr('id') == 'my') {

      state.data.y = $el.val();
      selection.setY(state.data.y);
      redraw();
    }

    if ($el.attr('id') == 'mz') {

      state.data.z = $el.val();
      // selection.setY(state.data.y); // TO DO
      redraw();
    }

    if ($el.attr('id') == 'ms') {

      state.data.scale = $el.val();
      selection.setScale(state.data.scale);
      redraw();
    }

    if ($el.attr('id') == 'mr') {

      state.data.rotate = $el.val();
      selection.setRotate(state.data.rotate);
      redraw();
    }

    if ($el.attr('id') == 'mrx') {

      state.data.rotateX = $el.val();
      //selection.setRotate(state.data.rotate); //TO DO
      redraw();
    }

    if ($el.attr('id') == 'mry') {

      state.data.rotateY = $el.val();
      //selection.setRotate(state.data.rotate); //TO DO
      redraw();
    }

  }


  var sequence = (function () {
    var s = 1;
    return function () {
      return s++;
    }
  })()


  function addSlide() {
    //console.log('add')
    //query slide id
    var id, $step;
    id = 'NewSlide' + sequence();
    $step = $('<div></div>').addClass('step builder-justcreated').html('<h1>This is a new step. </h1> How about some contents?');
    $step[0].id = id;
    $step[0].dataset.scale = 2;
    //console.log($('.step:last'))
    // works when the overview div is the first child of impress main div
    $step.insertAfter($('.step:last')); //not too performant, but future proof
    config.creationFunction($step[0]);
    // jump to the new slide to make some room to look around
    config['goto']($step[0]);

  }

  function showControls($where) {
    
    // var top, left, pos = $where.offset();
    // //not going out the edges (at least one way)
    // top = (pos.top > 0) ? pos.top + (100 / config.visualScaling) : 0;
    // left = (pos.left > 0) ? pos.left + (100 / config.visualScaling) : 0;

    // $controls.show().offset({
    //   top: top,
    //   left: left
    // });

    // difference between attr() and .val()
    $("#mx").val(state.data.x || 0);      
    $("#my").val(state.data.y || 0);
    $("#mz").val(state.data.z || 0);
    $("#mr").val(state.data.rotate || 0);
    $("#ms").val(state.data.scale || 0);
    $("#mrx").val(state.data.rotateX || 0);
    $("#mry").val(state.data.rotateY || 0);

  }

  function deleteContents() {
    var el = state.$node[0];
    if(el.getAttribute("id") !== "overview") {
      var r = confirm("Are you sure you want to delete this slide?");
      //console.log($(this))
      if (r == true) {
        config.deleteStep(el.getAttribute("id"));
        //console.log(  config)
        el.remove();
        // make showmenu not to display the deleted slides
        config.showMenu();
        config['goto']("overview");
      }
    }
  }

  var modalWindow = {  
    parent:"body",  
    windowId:null,  
    content:null,  
    width:null,  
    height:null,  
    close:function()  {  
      $(".modal-window").remove();  
      $(".modal-overlay").remove();  
    },  
    open:function()  {  
      var modal = "";  
      modal += "<div class=\"modal-overlay\"></div>";  
      modal += "<div id=\"" + this.windowId + "\" class=\"modal-window\" style=\"width:" + this.width + "px; height:" + this.height + "px; margin-top:-" + (this.height / 2) + "px; margin-left:-" + (this.width / 2) + "px; background: #fff;\">";  
      modal += this.content;  
      modal += "</div>";      

      $(this.parent).append(modal);  

      $(".modal-window").append("<a class=\"close-window\"></a>");  
      $(".close-window").click(function(e){e.stopPropagation();modalWindow.close();});  
      $(".modal-overlay").click(function(){modalWindow.close();});  
    }  
  }; 



  // Modal window with body background-color 
  // TO DO add the position of steps
  function openMyModal () {

    modalWindow.windowId = "myModal";  
    modalWindow.width = 860;  
    modalWindow.height = 515;  
    modalWindow.content = '<div class="theme">Themes <hr><span><img data-color="black" src="http://placehold.it/150x170/595A59">';
    modalWindow.content += '<img data-color="blue" src="http://placehold.it/150x170/D9EFF8"><img data-color="silver" src="http://placehold.it/150x170/EFF2D9">';
    modalWindow.content += '<img data-color="white" src="http://placehold.it/150x170/FAFAFA"><img data-color="yellow" src="http://placehold.it/150x170/F9EFA9">';
    modalWindow.content += '</span></div>';
    modalWindow.content += '<div class="theme">Layouts <hr><span><img id="theme-row" src="img/row.png">';
    modalWindow.content += '</span></div>';
    modalWindow.open();  

    $('#theme-row').on('click', function(event){
      selection.setLayout({
        layout:'grid'
        // margin :{
        //   x : 100
        // }
      });
    })

    $(".theme span").delegate('img', 'click', function() {
      
     var $body = $("body"),
      currentColor = $body.data("currentColor"),
      newColor = $(this).data("color");

      $body.removeClass(currentColor);

      if (currentColor === newColor)
        $body.data("currentColor","none");
      else
        $body.addClass(newColor).data("currentColor", newColor);

    });
  }


  // go to presentation mode 
  // remove the query from the url
  function gotoPresentation () {
    var re = /([^?]+).*/;
    var result = re.exec(document.location.href);
    document.location.href = result[1];
  }


  function loadData() {
    //state.data=state.$node[0].dataset;
    //add defaults
    state.data.x = parseFloat(state.$node[0].dataset.x) || defaults.x;
    state.data.y = parseFloat(state.$node[0].dataset.y) || defaults.y;
    state.data.z=parseFloat(state.$node[0].dataset.z) || defaults.z; //new   
    state.data.scale = parseFloat(state.$node[0].dataset.scale) || defaults.scale;
    state.data.rotate = parseFloat(state.$node[0].dataset.rotate) || defaults.rotate;
    state.data.rotateX=parseFloat(state.$node[0].dataset.rotateX) || defaults.rotate; //new
    state.data.rotateY=parseFloat(state.$node[0].dataset.rotateY) || defaults.rotate; //new
  }


  function redraw() {
    clearTimeout(redrawTimeout);
    redrawTimeout = setTimeout(function () {
      //state.$node[0].dataset=state.data;

      if (selection.length > 1) {
        for (var i = 0; i < selection.length; i++) {
          selection[i].$node[0].dataset.x = selection[i].data.x;
          selection[i].$node[0].dataset.y = selection[i].data.y;
          selection[i].$node[0].dataset.rotate = selection[i].data.rotate;
          selection[i].$node[0].dataset.scale = selection[i].data.scale;

          config.redrawFunction(selection[i].$node[0]);
        }
      }

      state.$node[0].dataset.scale = state.data.scale;
      state.$node[0].dataset.rotate = state.data.rotate;
      state.$node[0].dataset.rotateX = state.data.rotateX; //new
      state.$node[0].dataset.rotateY = state.data.rotateY; //new
      state.$node[0].dataset.x = state.data.x;
      state.$node[0].dataset.y = state.data.y; 
      state.$node[0].dataset.z = state.data.z; //new

      /**/
      //console.log(state.data,state.$node[0].dataset,state.$node[0].dataset===state.data);

      config.redrawFunction(state.$node[0]);
      showControls(state.$node);
      //console.log(['redrawn',state.$node[0].dataset]);
    }, 20);
  }

  function fixVector(x, y) {
    var result = {
      x: 0,
      y: 0
    },
      angle = (config.rotation / 180) * Math.PI,
      cs = Math.cos(angle),
      sn = Math.sin(angle);

    result.x = (x * cs - y * sn) * config.visualScaling;
    result.y = (x * sn + y * cs) * config.visualScaling;
    return result;
  }

  function handleMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();

    var x = e.pageX - mouse.prevX,
      y = e.pageY - mouse.prevY;

    mouse.prevX = e.pageX;
    mouse.prevY = e.pageY;
    if (mouse.activeFunction) {
      mouse.activeFunction(x, y);
      redraw();
    }

    return false;
  }

  return {
    init: init
  };


})();


// PLUGINS

$(function () {
    // Initialise plugin
    $('.slidable').slidingInput();

    // Accepts options object that override defaults, but step/min/max on input override options
    /*
        $('.slidable').slidingInput({
            step: 1,
            min: 0,
            max: 100,
            tolerance: 2
        });
    */
});


// LAYOUTS

// var currentX =0,
// currentY =0,


// //row
// $(selectedElements).each(function(index){
//   var $el = $(this);
//   $el.dataset.x = currentX;
//   $el.dataset.y = currenty;
//   currentX += paddingX + $el.width();
// })

// //row
// $(selectedElements).each(function(index){
//   var $el = $(this);
//     $el.dataset.x = currentX;
//    $el.dataset.y = currenty;
//    currentY += paddingY + $el.height();
// })

// //grid
// $(selectedElements).each(function(index){
//   var $el = $(this);
//   $el.dataset.x = (index % itemsPerRow) * rowWidth; 
//   $el.dataset.y = (index / itemsPerRow) * rowHeight; 
// })
