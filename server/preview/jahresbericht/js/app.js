var isIpad = navigator.userAgent.match(/iPad/i) != null

// global var
var mobile = false

$(document).ready(function () {
  // init lazyload plugin
  $('img').lazyload({
    threshold: 200
  })

  // initScroller();
  $('#read').addClass('readnoshift')
  checkBrowserWidth()

  // initialize menu
  if (isTopOfPage()) {
    if (mobile) {
      $('#ressources').addClass('startanimationm')
    } else {
      $('#ressources').addClass('startanimation')
    }
  } else {
    hideFlyout()
  }

  // Ipad Horizontal Background Click Fix
  if (isIpad) {
    $('*').css('cursor', 'pointer')
  }

  // init waypoints plugin
  // Waypoints - Ein- und Ausblenden von Ressourcen
  // ein und ausblenden des headers - wird beim nach unten scrollen ausgeblendet
  $('#scrollmarker').waypoint({
    handler: function (direction) {
      if (direction === 'down' && !$('#ressources').hasClass('showdefinitions')) {
        hideFlyout()
      } else {
        // show cover when on top of page
        showCover()
      }
    }
  })

  // Tooltip for desktop
  if (!mobile && !isIpad) {
    $('img').hover(function(e){
      var text = $(this).next("figcaption").html();
      $('<div class="tooltip"></div>').html(text).appendTo('body');
    }, function() {
        $('.tooltip').remove();
    }).mousemove(function(e) {
        var mouseX = e.pageX + 20;
        var mouseY = e.pageY + 10;
        $('.tooltip').css({ top: mouseY, left: mouseX })
    });
  }

}) //close ready


// listeners
$(window).resize(function () {
  checkBrowserWidth()
  resetLayout()
})

// click on internal links
$("a:not(.external-link)").click(function(event){
  event.preventDefault()
  //console.log($(this.hash).offset().top);
  var scrollspeed = 1200

  if ($(window).scrollTop() - $(this.hash).offset().top < 1000) {
      scrollspeed = 600
  }

  $('html,body').animate({scrollTop:$(this.hash).offset().top}, scrollspeed)

  // windows phone
  setTimeout(function () {
    window.scrollTo(0, $(this.hash).offset().top);
  }, scrollspeed + 80)
})

// click on resources
$("#ressources").click(function (e) {
  e.stopPropagation()
})

// hide flyout
$('document, body, #closeicon').click(function () {
  hideFlyout()
})

$('#nav a').click(function () {
  if (mobile) hideFlyout()
})

$('#navicon').click(function (e) {
  console.log('click on nav icon')
  showTableOfContent()
  e.stopPropagation()
})

// click on definition -> show info
$('.shortcut').click(function (e) {
  showDefinition($(this))
  e.stopPropagation()
})

$('.picture').click(function(e){
    zoomPicture($(this));
    e.stopPropagation();
})

// exceptions
$( ".picturegroup" ).each(function () {
    console.log($(this).prev());
})

// add class to headings followed by paragraphs
$('h1').each(function () {
  if ($(this).next().is('p')) {
    $(this).addClass('h1ex')
  }
})

function checkBrowserWidth () {
  var browserwidth = $(document).width()
  mobile = browserwidth < 801
}

function resetLayout () {
  var currentclass = $("#ressources").attr("class");
  if (mobile) {
    if(currentclass.slice(-1) !== "m" && currentclass !== "showtableofcontent") {
      currentclass = currentclass + "m"
      $("#ressources").removeClass()
      $("#ressources").addClass(currentclass)
    }
    $("#read").removeClass("shiftread")

  } else {
    if (currentclass.slice(-1) == "m" || currentclass == "showtableofcontent"){
      if (currentclass == "showtableofcontent"){
        $("#ressources").removeClass();
        $("#ressources").addClass("showdefinitions");
        $("#read").addClass("shiftread");
      } else {
        currentclass = currentclass.substring(0, currentclass.length - 1);
        $("#ressources").removeClass();
        $("#ressources").addClass(currentclass);
      }
    }
  }
}

// display cover with title and background image
function showCover () {
  hideFlyout()
  var animationClass = mobile ? 'startanimationm' : 'startanimation'
  $('#ressources').addClass(animationClass)
  $('#titletextbg').show()
}

function hideFlyout () {
  // remove classes
  $("#ressources").removeClass()
  $("#navicon").removeClass()
  $("#closeicon").removeClass()
  $(".activeressource").removeClass("activeressource")
  $(".shiftread").removeClass("shiftread")
  $("#read").addClass("readnoshift")

  // clear content
  clearContent()

  // hide navigation elements
  $("#nav").hide()
  $("#closeicon").hide()

  var miniClass = mobile ? 'minifiedm' : 'minified'
  $('#ressources').addClass(miniClass)
  $("#navicon").show()
}

function resetRessource(navicon, nav, closeicon){
  // remove classes
  $("#ressources").removeClass();
  $("#navicon").removeClass();
  $("#closeicon").removeClass();
  $(".activeressource").removeClass("activeressource");
  $("#titletextbg").hide();
  $("#imagecontainer").hide();

  // clear content
  // $("#ressourcestext").text("");
  // $("#ressources img").remove();
  // $(".figcaption").remove();
  // $("#ressources .picture-metadata").remove();
  // $("#gradient").hide();
  clearContent()

  // nav elements
  if (navicon) {
    $("#navicon").show();
  } else {
    $("#navicon").hide();
  }

  if (nav) {
    $("#nav").show();
  } else {
    $("#nav").hide();
  }

  if (closeicon) {
    $("#closeicon").show();
  } else {
    $("#closeicon").hide();
  }
}

function showTableOfContent () {
  resetRessource(false, true, true)
  if (mobile) {
    $('#ressources').addClass('showtableofcontent')
    $('#gradient').show()
  } else {
    showDesktopMenu()
  }

  // set active layer
  $(".activeressource").removeClass("activeressource");
  $("#nav").addClass("activeressource");

  if ($(".active").length > 0) {
    $('#nav').scrollTop(0);
    $('#nav').scrollTop($(".active").offset().top - $("#nav").offset().top - 100);
  } else {
    $('#nav').scrollTop(0);
  }
}

// show definitions
function showDefinition (clickedWord) {
  // shortcuts
  var $hamburgerIcon = $("#navicon")

  resetRessource(false, false, true)
  var scrollTop = $(window).scrollTop()
  var elementOffset = clickedWord.offset().top
  var distance = (elementOffset - scrollTop)
  var overlay = 300
  var scrollback = overlay - distance

  if (distance < overlay && mobile === true) {
    $('html, body').animate({
      scrollTop: $(window).scrollTop() - scrollback
    })
  }

  // find tooltip text
  // get attr of clicked word
  // to every clicked word - there is a class with it's id -> that contains the text
  clickedWord.find('.definition').clone().appendTo('#ressourcestext')
  // var identifier = clickedWord.attr('id')
  // console.log($('.' + identifier))
  // $('.' + identifier).clone().appendTo('#ressourcestext')

  if (mobile) {
    $("#ressources").addClass("showdefinitionsm");
    $("#gradient").show();
  } else {
    showDesktopMenu()
  }

  // set active layer
  $(".activeressource").removeClass("activeressource");
  $("#ressourcestext").addClass("activeressource");

  mobile ? $hamburgerIcon.hide() : $hamburgerIcon.show()
}

function zoomPicture (clickedpicture) {
  if (!mobile) {
    resetRessource(true, false, true);
    var source = clickedpicture.attr('src');
    var figcaption = $('<p class="figcaption">' + clickedpicture.next("figcaption").html() + '</p>');
    //var zoomedpicture = $("<img src='" + source + "' />");
    //zoomedpicture.appendTo("#ressources");
    figcaption.appendTo("#ressources");
    $("#imagecontainer").css("background", "url(" + source + ") black");
    $("#imagecontainer").show();

    if(mobile){
        $("#ressources").addClass("showpicturesm");
    }
    else {
        $("#ressources").addClass("showpictures");
    }

    $("#navicon").addClass("white");
    $("#closeicon").addClass("white");
  } else {
      hideFlyout();
  }
}

function isTopOfPage() {
  return $(window).scrollTop() === 0
}

function showDesktopMenu () {
  $("#ressources").addClass("showdefinitions");
  $("#read").removeClass("readnoshift");
  $("#read").addClass("shiftread");
}

function clearContent() {
  $("#ressourcestext").text("")
  $("#ressources img").remove()
  $(".figcaption").remove()
  $("#ressources .picture-metadata").remove()
  $("#titletextbg").hide()
  $("#imagecontainer").hide()
  $("#gradient").hide()
}