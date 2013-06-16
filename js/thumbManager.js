var ThumbManager = function (options, $){
  this.options = options

  , this.$thumbs = $([])

  // external function that will redraw all the slides
  , this.redrawSlideShow = function(){}

  // sels for thumbs and containers
  , this.sels = {
    thumbsBarId: "#thumbs-bar",
    thumbsHolderId    : "#thumb-holder",
    thumbContainerClass  : "thumb",
    slideThumbClass : "thumb-step",
    dragBarId: "#thumbs-bar #dragbar",
  }

  /** @function validateAndSetOptions
  *   @description: validates external options and, if valid, overrides defaults
  */
  ThumbManager.prototype.validateAndSetOptions = function (options){
    if(!options){return;}

    if(options.sels){
      for (var key in this.sels){
        if( options.sels[key]){
          if(!(typeof options.sels[key] == "string")){
            console.log("Error atThumbManager.validateAndSetOptions(): options.sels." + key + " should be a string")
            return;
          }else{
            this.sels[key] = options.sels[key];
          }
        } 
      }
    }
  }

  /** @function init
  *   @description: adds resize listeners to the thumb container,
  *   and creates the thumbs for existing slides
  */
  ThumbManager.prototype.init = function(){
    this.validateAndSetOptions(this.options)
    var that = this
    , sels = this.sels;

    // setup resize listeners

    $(sels.thumbsBarId).on("click", '.' + sels.slideThumbClass, function(e){
      var thumbId = $(this).attr('id')
      , slideRefId = $(this).data('references');

      triggerEvent(document, "thumbmanager:thumb-clicked", {thumbId: thumbId, slideRefId: slideRefId}) 
    });

    $(sels.dragBarId).on("mousedown.dragbar",function(e){
      e.preventDefault();
      var $document = $(document)

      $document.on('mouseup.dragbar',function(e){          
        $document.off('mousemove.dragbar');
        $document.off('mouseup.dragbar');
      });
     
      
      $document.on('mousemove.dragbar',function(e){
        var newWidth = $(window).innerWidth() - e.clientX;
        //return if too big or too small
        if(newWidth > 500 || newWidth < 100) return;

        $(sels.thumbsBarId).css("width",newWidth);
        that.resizeThumbs();
      })
    });
    
    // add thumbs:

    //choose all elements except from overview
    var $steps = $('.step:not(#overview)');
    $steps.each(function(){
     that.$thumbs = that.$thumbs.add(that.createThumb($(this)))
    })

    that.$thumbs.each( function(index){
      var $this = $(this);
      $(sels.thumbsBarId + ' ' + sels.thumbsHolderId).append($this)
      $this
        .wrap('<div class="'+ sels.thumbContainerClass +'"></div>')
      this.style["-webkit-transform-origin"] = "0 0";
       $this.parent()
        .css("background", $('body').css('background'));
    })

    that.resizeThumbs();

    $(sels.thumbsHolderId).sortable({
      stop: function(event, ui)
      {

        var $thumbStep  = $(ui.item).find('.' + sels.slideThumbClass)
        , thumbId       = $thumbStep.attr('id')
        , slideRefId    = $thumbStep.data('references')
        , newIndex      = $(ui.item).index();

        console.log($thumbStep)

        triggerEvent(document, "thumbmanager:thumb-sorted", {thumbId : thumbId, slideRefId : slideRefId, newIndex : newIndex}) 
      }
    })
  
  }

  ThumbManager.prototype.updateThumb = function(){}

  ThumbManager.prototype.insertThumb = function(){}

  /** @function resizeThumbs
  *   @description: resizes all thumbs to fit their container width
  */
  ThumbManager.prototype.resizeThumbs = function(){
    // calculate padding margin and border width for left and right for each thumbContainer
    var $thumbContainer = $(this.sels.thumbsBarId + ' .' + this.sels.thumbContainerClass).eq(0);
    var outerWidth =  parseInt($thumbContainer.css("padding-left").replace("px", "")) + parseInt($thumbContainer.css("padding-right").replace("px", ""));
    outerWidth +=  parseInt($thumbContainer.css("margin-left").replace("px", "")) + parseInt($thumbContainer.css("margin-right").replace("px", ""))
    outerWidth +=  parseInt($thumbContainer.css("border-left-width").replace("px", "")) + parseInt($thumbContainer.css("border-right-width").replace("px", ""));
    var thumbContentWidth = $(this.sels.thumbsBarId).innerWidth() - outerWidth;

    this.$thumbs.each( function(index){
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
  ThumbManager.prototype.createThumb = function($orig){
    var that = this
    , $clone = $orig.clone()
    , cloneId = $clone.attr("id");

    $clone
      //change id only if not empty
      .attr("id", (cloneId === undefined || cloneId == '') ? '' : cloneId + "-thumb")
      .attr("class",that.sels.slideThumbClass)
      //copy original computed style
      .css(that.css($orig))
      //add reference to original slide
      .data('references', $orig.attr('id'))

    var $cloneChildren = $clone.find('*');
    //copy original computed style for children
    $orig.find('*').each(function(index){
      var id = $cloneChildren.eq(index).attr("id");
      $cloneChildren.eq(index)
        //change id only if not empty
        .attr("id", (id === undefined || id == '') ? '' : id + "-thumb")
        .attr("class", "")
        //copy original computed style
        .css(that.css($(this)));
    });

    return $clone

  }

  /** @function css
  *   @description: Gets the computed styles of an element and returns
  *   key value pair of rules (compatible with jQuery)
  */
  ThumbManager.prototype.css = function(a){
      var rules = window.getComputedStyle(a.get(0));
      return this.css2json(rules);
  }

  /** @function css2json
  *   @description: Converts CSSStyleDeclaration objects or css rules
  *   in string format to key value pairs (compatible with jQuery)
  */
  ThumbManager.prototype.css2json = function(css){
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

  /** copied from impress.js (Copyright 2011-2012 Bartek Szopka (@bartaz))
  * @function triggerEvent
  * @description builds a custom DOM event with given `eventName` and `detail` data
  * and triggers it on element given as `el`.
  */
  var triggerEvent = function (el, eventName, detail) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(eventName, true, true, detail);
    el.dispatchEvent(event);
  };

  var that = this;
  $(function(){
    that.init()
  })
  

}


