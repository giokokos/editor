window.asqEditor = function () {
  'use strict';

  var iAPI = impress();
  var myNicEditor = new nicEditor();

  // makes the element with the given id editable
  function makeEditable(id){ 
    myNicEditor.addInstance(id);
  }

  function save(){
    var $clone = $('#impress').clone();
    $clone
      .removeAttr('style')
      .find('.step')
        .unwrap()
        .removeClass('past present future active')
        .removeAttr('contenteditable')
        .removeAttr('style');
    return ($clone.eq(0));
  }

  document.addEventListener("keydown", function (event) {
    // Escape button
    if (event.keyCode == 27) {
      iAPI.goto("overview");
      event.preventDefault();
    }
  }, false);

  if (!window.location.search.match(/print/)) {
    iAPI.init();
  } else {
    var substeps = document.querySelectorAll(".substep");
    Array.prototype.forEach.call(substeps, function (dom, index) {
      dom.classList.add("active");
    })
  }

  if (window.location.search.match(/edit/)) {

  //setup niceditor. We add the current steps
  // for new slides we call the makeEditable function
  bkLib.onDomLoaded(function() {
    myNicEditor.setPanel('myNicPanel');

    //make each step editable
    $('.step').each(function(){
      myNicEditor.addInstance(this.id);
    });
  });

    iAPI.showMenu();
    builder.init({
      "goto": iAPI['goto'], //it makes me feel better this way
      creationFunction: iAPI.newStep, //future API method that adds a new step
      redrawFunction: iAPI.initStep, //future API method that (re)draws the step
      deleteStep: iAPI.deleteStep,
      showMenu: iAPI.showMenu,
      setTransformationCallback: iAPI.setTransformationCallback, //future API method that lets me know when transformations change
      makeEditable: makeEditable
    });
  } else {
    // if (!window.location.search.match(/print/)) {
    //   if (hljs) {
    //     hljs.initHighlightingOnLoad();
    //   }
    //   //impressConsole().init();

    // }

    // if (!window.location.search.match(/preview/)) {
    //   iAPI.showMenu();
    // }

    //Add slide counters
    var forEach = Array.prototype.forEach,
      keys = Object.keys,
      steps = document.querySelectorAll("div.step")

      forEach.call(steps, function (dom, index) {
        if (dom.id !== 'overview') {
          var wrap = document.createElement("div");
          wrap.className = 'wrap';
          while (dom.firstChild) {
            wrap.appendChild(dom.firstChild);
          }
          dom.appendChild(wrap);
          var counter = wrap.appendChild(document.createElement('div'));
          counter.className = "counter";
          counter.innerHTML = (index + 1) + " / " + steps.length;
        }
      });
  }


  var start = Date.now();
  var timerDom = document.getElementById('timer'),
    log = window.TIMELOG = [];

  var durationToStr = function () {
    var now = Date.now(),
      min = String(Math.floor((now - start) / (1000 * 60))),
      sec = String(Math.floor((now - start) / (1000)) % 60);
    return ((min.length > 1) ? min : ('0' + min)) + ':' +
      ((sec.length > 1) ? sec : ('0' + sec));
  };
  // setInterval(function () {
  //     timerDom.innerHTML = durationToStr();
  // }, 1000);

  if ("ontouchstart" in document.documentElement) {
    document.querySelector(".hint").innerHTML = "<p>Tap on the left or right to navigate</p>";
  }

  if (window.location.search.match(/print/)) {
    window.print();
  }

  return {
    save: save
  }

}());