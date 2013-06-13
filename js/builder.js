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
   // console.log('Checking ' + s.$node.attr('id'));
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
    //$menu = $('<div id="builder-main"></div>');
   // $('<div class="builder-bt"></div>').appendTo($menu).text('Save').on('click', SaveContent); // TODO
   // $('<div class="builder-bt"></div>').appendTo($menu).text('Preview'); // TODO
   // $('<div class="builder-bt"></div>').appendTo($menu).text('Settings').on('click', openMyModal);
   // $('<div class="builder-bt"></div>').appendTo($menu).text('Overview').on('click', function () { config['goto']('overview'); });
   // $('<div class="builder-bt bt-delete"></div>').appendTo($menu).text('Delete').on('click', deleteContents);

    // Add slide
    //$('<span class="plus"></span>').wrap('<div class="bt-add-slide"></div>').text('+').parent().appendTo('body').on('click', addSlide);

    // Return to presentation 
    //$('<span></span>').wrap('<a href="#" class="back-button">◄ </a>').text('Your presentation').parent().appendTo('body').on('click', gotoPresentation);

    // Sliders 
    // $sliders = $('<div id="sliders"></div>');
    // $('<div class="sliders-button">Position</div>').appendTo($sliders);
    // $('<span>X: </span>').appendTo($sliders);
    // $('<input type="text" class="slidable" step="1" min="-Infinity" max="Infinity" placeholder="X">').attr('id', 'mx').addClass('bt-text').text('Edit').appendTo($sliders);
    // $('<span>Y: </span>').appendTo($sliders);
    // $('<input type="text" class="slidable" step="1" min="-Infinity" max="Infinity" placeholder="Y">').attr('id', 'my').addClass('bt-text').text('Edit').appendTo($sliders);
    // $('<span>Z: </span>').appendTo($sliders);
    // $('<input type="text" class="slidable" step="1" min="-Infinity" max="Infinity" placeholder="Z">').attr('id', 'mz').addClass('bt-text').text('Edit').appendTo($sliders);

    // $('<div class="sliders-button">Scale</div>').appendTo($sliders);
    // $('<span>S: </span>').appendTo($sliders);
    // $('<input type="text" class="slidable" step="0.01" min="-100" max="100" placeholder="Sz">').attr('id', 'ms').addClass('bt-text').text('Edit').appendTo($sliders);

    // $('<div class="sliders-button">Rotation</div>').appendTo($sliders);
    // $('<span>X: </span>').appendTo($sliders);
    // $('<input type="text" class="slidable" step="1" min="-360" max="360" placeholder="Rx">').attr('id', 'mrx').addClass('bt-text').text('Edit').appendTo($sliders);
    // $('<span>Y: </span>').appendTo($sliders);
    // $('<input type="text" class="slidable" step="1" min="-360" max="360" placeholder="Ry">').attr('id', 'mry').addClass('bt-text').text('Edit').appendTo($sliders);
    // $('<span>Z: </span>').appendTo($sliders);
    // $('<input type="text" class="slidable" step="1" min="-360" max="360" placeholder="Rz">').attr('id', 'mr').addClass('bt-text').text('Edit').appendTo($sliders);


   // $menu.appendTo('body');
   // $sliders.appendTo('body');

    $controls = $('<div class="builder-controls"></div>').hide();

  //  $('<div class="bt-delete"></div>').attr('title', 'Delete').click(deleteContents).appendTo($controls);
    $('<div class="bt-move border"></div>').attr('title', 'Move').data('func', 'move').appendTo($controls);
    $('<div class="bt-rotate border"></div>').attr('title', 'Rotate').data('func', 'rotate').appendTo($controls);
    $('<div class="bt-scale border"></div>').attr('title', 'Scale').data('func', 'scale').appendTo($controls);
    $('<div class="bt-rotateX"></div>').attr('title', 'RotateX').data('func', 'rotateX').appendTo($controls);

    //render the layout HTML
    dust.render('layout', {}, function(err,out){
      $('body').append(out)
          //initialize the layoutManager which manages the alignment panel
      var layoutManager = new LayoutManager(
      { 
        selection : selection,
        redrawFunction : config.redrawFunction
      }, jQuery);
    })

    $('.button.save').on('click', function () { asqEditor.save(); });
    $('.button.overview').on('click', function () { config['goto']('overview'); });
    $('.button.back').on('click', gotoPresentation);
    $('.button.add').on('click', addSlide);
   

    // var links = "<ul>";
    // [].forEach.call(document.querySelectorAll(".step"), function( el, idx ){
    //     links += "<li><a href='#" + el.id + "'>Step " + idx + "</a></li>";
    // })
    // links += "</ul>";

    // $('<nav></nav>').html(links).appendTo(".timeline");


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
     // if ($(this).attr('id') !== 'overview') 
      var $t = $(this);
     // console.log($t.attr('id'))
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
      }, 100);
      $t.data('showTimer', showTimer);
    }).on('mouseleave', '.step', function () {
      //not showing when not staying
      clearTimeout($(this).data('showTimer'));
    });


    // keep hover effect when leaving from a step
    // the user can see which element is selected
    $('body').on('mouseenter', '.step', function(e) {
      $('#impress').find('.hover').removeClass('hover');
      $(this).addClass('hover')
    }).on('mouseleave', '.step', function(){
      $(this).addClass('hover')
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

  var offset = (function () {
    var offset = 0;
    return function () {
      return offset+=1100;
    }
  })()

  function addSlide() {
    //console.log('add')
    //query slide id
    var id, $step;
    var seq = sequence();
    id = 'NewSlide' + seq;
    $step = $('<div class="step"></div>').html('<h1>This is a new step ' + seq + '</h1> <p>How about some contents?</p>');
    $step[0].id = id;
    $step[0].dataset.x = offset();
    $step[0].dataset.scale = 1;
    //console.log($('.step:last'))
    // works when the overview div is the first child of impress main div
    $step.insertAfter($('.step:last')); //not too performant, but future proof
    config.creationFunction($step[0]);
    // jump to the new slide to make some room to look around
    //config.showMenu();
    config.makeEditable(id);
    config['goto']($step[0]);

  }

  function showControls($where) {
    
    var top, left, pos = $where.offset();
    //not going out the edges (at least one way)
    top = (pos.top > 0) ? pos.top + (100 / config.visualScaling) : 0;
    left = (pos.left > 0) ? pos.left  + (100 / config.visualScaling) : 0;

    $controls.show().offset({
      top: top,
      left: left
    });

    // difference between attr() and .val()
    $("#mx").val(state.data.x || 0);      
    $("#my").val(state.data.y || 0);
    $("#mz").val(state.data.z || 0);
    $("#mr").val(state.data.rotate || 0);
    $("#ms").val(state.data.scale || 0);
    $("#mrx").val(state.data.rotateX || 0);
    $("#mry").val(state.data.rotateY || 0);

  }

  // function SaveContent() {
  //   asqEditor.save()
  // }

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


  function closeModal(event){
    event.stopPropagation();
    $(".close-window").off('click');
    $(".modal-overlay").off('click')
    $(".modal-window").remove();  
    $(".modal-overlay").remove();  
  } 



  // Modal window with body background-color 
  // TO DO add the position of steps
  function openMyModal () {

    var obj = {  
      width:860,  
      height:515,
      marginTop: -515/2,
      marginLeft: -860/2
    }

    dust.render('modal', obj, function(err,out){
      $('body').append(out)
      $(".close-window").click(closeModal);  
      $(".modal-overlay").click(closeModal); 
    })

    $('#theme-row').on('click', function(event){
      selection.setLayout({
        layout:'row'
        // margin :{
        //   x : 100
        // }
      });
    })

    $('#theme-column').on('click', function(event){
      selection.setLayout({
        layout:'column'
        // margin :{
        //   x : 100
        // }
      });
    })

    $('#theme-grid').on('click', function(event){
      selection.setLayout({
        layout:'grid'
        // margin :{
        //   x : 100
        // }
      });
    })

    $('#theme-circle').on('click', function(event){
      selection.setLayout({
        layout:'circle'
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

  // copied from impress.js Copyright 2011-2012 Bartek Szopka (@bartaz)
  var pfx = (function() {
    var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
    return function(prop) {
        if (typeof memory[ prop ] === "undefined") {
            var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
            memory[ prop ] = null;
            for (var i in props) {
                if (style[ props[i] ] !== undefined) {
                    memory[ prop ] = props[i];
                    break;
                }
            }
        }
        return memory[ prop ];
    };
  }());

  function getTrans3D() {

    var prefix = (pfx('transform'));
    var trans = $("#impress div:first-child")[0].style['' + prefix + ''].match(/.+?\(.+?\)/g);
    var dico = {};
    for (var el in trans) {
        var ele = trans[el];
        var key = ele.match(/.+?\(/g).join("").match(/[a-zA-Z0-9]/g).join("");
        var value = ele.match(/\(.+\)/g)[0].split(",");
        if (value.length <= 1) {
            value = parseFloat(value[0].match(/-[0-9]+|[0-9]+/g)[0]);
            dico[key] = value;
        } else {
            dico[key] = {};
            for (val in value) {
                var vale = parseFloat(value[val].match(/-[0-9]+|[0-9]+/g)[0]);
                dico[key][val] = vale;
            }
        }
    }
    return dico;

  }

  // copied from impress.js Copyright 2011-2012 Bartek Szopka (@bartaz)
  // `translate` builds a translate transform string for given data.
  function translate(t) {
    return " translate3d(" + t.translate3d[0] + "px," + t.translate3d[1] + "px," + t.translate3d[2] + "px) ";
  };

  // copied from impress.js Copyright 2011-2012 Bartek Szopka (@bartaz)
  // `rotate` builds a rotate transform string for given data.
  // By default the rotations are in X Y Z order that can be reverted by passing `true`
  // as second parameter.
  function rotate(r, revert) {
    var rX = " rotateX(" + r.rotateX + "deg) ",
      rY = " rotateY(" + r.rotateY + "deg) ",
      rZ = " rotateZ(" + r.rotateZ + "deg) ";

    return revert ? rZ + rY + rX : rX + rY + rZ;
  };

  // copied from impress.js Copyright 2011-2012 Bartek Szopka (@bartaz)
  // `css` function applies the styles given in `props` object to the element
  // given as `el`. It runs all property names through `pfx` function to make
  // sure proper prefixed version of the property is used.
  function css  (el, props) {
    var key, pkey;
    for (key in props) {
      if (props.hasOwnProperty(key)) {
        pkey = pfx(key);
        if (pkey !== null) {
          el.style[pkey] = props[key];
        }
      }
    }
    return el;
  };


  $(document).mousewheel(function(event, delta, deltaX, deltaY) {

    // hack similar in the impress.js to deactivate all handlres when editing a step
    // TODO: not so efficient because of the parentNode
    var target = event.target;

    if (target.classList.contains('nicEdit-selected') || target.parentNode.classList.contains('nicEdit-selected')) {
      return;
    }

    var transform = getTrans3D();
    transform.translate3d[2] = transform.translate3d[2] + deltaY * 10;

    //set transfor and then
    //set transition to 0 for fast response. We don' need impress animations when zooming
    css($('#impress div:first-child')[0], {
      transform: rotate(transform, true) + translate(transform),
      transition: "all 0 ease 0" 
    })
  }); 

  // credits to https://github.com/clairezed/ImpressEdit 
  // compute the right angle for the position and rotation
  function angle (obj, e) {
      var alpha = obj.rotateX * 2 * Math.PI / 360;
      var beta = obj.rotateY * 2 * Math.PI / 360;
      var gamma = obj.rotateZ * 2 * Math.PI / 360;


      var dReal = {
          x: e.pageX - $("#impress").data('event').pos.x,
          y: e.pageY - $("#impress").data('event').pos.y
      };

      var scale = -1;

      var dVirtuel = {
          x: 0,
          y: 0,
          z: 0
      };

      //to rotate in Z
      dVirtuel.x += dReal.x * Math.cos(gamma) + dReal.y * Math.sin(gamma);
      dVirtuel.y += dReal.y * Math.cos(gamma) - dReal.x * Math.sin(gamma);
      dVirtuel.z += 0;

      //to rotate in X
      dVirtuel.x += dReal.x;
      dVirtuel.y += dReal.y * Math.cos(alpha);
      dVirtuel.z += -dReal.y * Math.sin(alpha);

      //to rotate in Y
      dVirtuel.x += dReal.x * Math.cos(beta);
      dVirtuel.y += dReal.y * Math.cos(beta) - dReal.y * Math.sin(beta);
      dVirtuel.z += dReal.x * Math.sin(beta);

      var dVirtuel = {
          x: 0,
          y: 0,
          z: 0
      };

      dVirtuel.x += dReal.x * (Math.cos(gamma) + Math.cos(beta)) + dReal.y * Math.sin(gamma);
      dVirtuel.y += dReal.y * (Math.cos(gamma) + Math.cos(alpha) + Math.cos(beta) - Math.sin(beta)) - dReal.x * Math.sin(gamma);
      dVirtuel.z += dReal.x * Math.sin(beta) - dReal.y * Math.sin(alpha);
      //
      dVirtuel.x *= scale;
      dVirtuel.y *= scale;
      dVirtuel.z *= scale;

      var object = {
        dVirtuelX : dVirtuel.x,
        dVirtuelY : dVirtuel.y,
        dVirtuelZ : dVirtuel.z

      }
      return object;
  }


  // copied from https://github.com/clairezed/ImpressEdit
  $(document).mousedown(function(event) {

    // hack similar in the impress.js to deactivate all handlres when editing a step
    // TODO: not so efficient because of the parentNode
    var target = event.target;

    if (target.classList.contains('nicEdit-selected') || target.parentNode.classList.contains('nicEdit-selected')) {
      return;
    }

    $("#impress").data('event', {
        pos: {
            x: event.pageX,
            y: event.pageY
        }
    });

    // hold the left click to move the viewport
    if (event.which === 1) {
      $(this).on('mousemove.moveView', function(event) {
        var transform = getTrans3D();
        var obj = angle(transform, event);

        transform.translate3d[0] = parseInt(transform.translate3d[0] - obj.dVirtuelX);
        transform.translate3d[1] = parseInt(transform.translate3d[1] - obj.dVirtuelY);
        transform.translate3d[2] = parseInt(transform.translate3d[2] - obj.dVirtuelZ);

        // update the old mouse position 
        $("#impress").data('event').pos.x = event.pageX;
        $("#impress").data('event').pos.y = event.pageY;
        
        css($('#impress div:first-child')[0], {
          transform: rotate(transform, true) + translate(transform),
          transition: "all 0 ease 0" 
        })

      });

    }

    // hold the middle mouse click to rotate the viewport
    if (event.which === 2) {

      $(this).on('mousemove.rotateView', function(event) {

        var transform = getTrans3D();
        var obj = angle(transform, event);

        transform.rotateX = parseInt(transform.rotateX - obj.dVirtuelX);
        transform.rotateY = parseInt(transform.rotateY - obj.dVirtuelY);
        transform.rotateZ = parseInt(transform.rotateZ - obj.dVirtuelZ);

        // update the old mouse position 
        $("#impress").data('event').pos.x = event.pageX;
        $("#impress").data('event').pos.y = event.pageY;
        
        css($('#impress div:first-child')[0], {
          transform: rotate(transform, true) + translate(transform),
          transition: "all 0 ease 0" 
        })

      });
    }

    // unbind handlers
    $(this).on("mouseup", function() {
      $('body').css('cursor', 'default');
      $(this).off(".moveView");
      $(this).off(".rotateView");
    });
   

  }); 


});

