"use strict";

var Reader = {
    isMobile: false,

    /**
     * fixes horizontal background click for iPads
     */
    fixIPadHorizontalClick: function() {
        if (navigator.userAgent.match(/iPad/i) !== null) {  // is Ipad
            $("*").css("cursor", "pointer");
        }
    },

    /**
     * determines if the user uses a mobile width. sets true if mobile, false
     * if desktop.
     */
    determineMobile: function() {
        var browserwidth = $( document ).width();
        if (browserwidth < 800){
            this.isMobile = true;
        } else {
            this.isMobile = false;
        }
    },

    clearRessource: function() {

        // remove classes
        $("#ressources").removeClass();
        $("#navicon").removeClass();
        $("#closeicon").removeClass();
        $(".activeressource").removeClass("activeressource");

        // clear content
        $("#ressourcestext").text("");
        $("#ressources img").remove();
        $(".figcaption").remove();
        $("#titletextbg").hide();
        $("#imagecontainer").hide();

        // hide navigation elements
        $("#nav").hide();
        $("#closeicon").hide();


        if (this.isMobile){
            $("#ressources").addClass("minifiedm");
        } else {
            $("#ressources").addClass("minified");
        }

        $("#navicon").show();
    },

    /**
     * Reset content of resources panel.
     * @param {boolean} navicon - If navigation icon exists.
     * @param {boolean} nav - ???.
     * @param {boolean} closeicon - If closing icon exists.
     */
    resetRessource: function(navicon, nav, closeicon) {

        // remove classes
        $("#ressources").removeClass();
        $("#navicon").removeClass();
        $("#closeicon").removeClass();
        $(".activeressource").removeClass("activeressource");
        $("#titletextbg").hide();
        $("#imagecontainer").hide();

        // clear content
        $("#ressourcestext").text("");
        $("#ressources img").remove();
        $(".figcaption").remove();

        // nav elements
        if (navicon){
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
    },

    showTableOfContent: function() {

        this.resetRessource(false, true, true);

        if (this.isMobile){
            $("#ressources").addClass("showtableofcontent");
        } else {
            $("#ressources").addClass("showdefinitions");
        }

        // set active layer
        $(".activeressource").removeClass("activeressource");
        $("#nav").addClass("activeressource");

    },

    /**
     * Shows the clicked words definition in the resources panel.
     * Gets the div that has the same class as the clicked word's ID and appends
     * that content to the resourcestext div.
     * @param {string} clickedWordID - ID of clicked word.
     */
    showGlossar: function(clickedWordID) {

        this.resetRessource(false, false, true);

        // find tooltip text
        $("." + clickedWordID).clone().appendTo("#ressourcestext");

        if (this.isMobile){
            $("#ressources").addClass("showdefinitionsm");
        } else {
            $("#ressources").addClass("showdefinitions");
        }

        // set active layer
        $(".activeressource").removeClass("activeressource");
        $("#ressourcestext").addClass("activeressource");

        if (!this.isMobile) {
            $("#navicon").show();
        } else {
            $("#navicon").hide();
        }
    },

    /**
     * Shows the clicked picture the resources panel..
     * @param {string} source
     * @param {string} text
     */
    zoomPicture: function(source, text) {
        if (!this.isMobile) {

            this.resetRessource(true, false, true);

            var figcaption = $('<p class="figcaption">' + text + '</p>');
            //var zoomedpicture = $("<img src='" + source + "' />");
            //zoomedpicture.appendTo("#ressources");
            figcaption.appendTo("#ressources");
            $("#imagecontainer").css("background", "url(" + source + ") black");
            $("#imagecontainer").show();

            if (this.mobile) {
                $("#ressources").addClass("showpicturesm");
            } else {
                $("#ressources").addClass("showpictures");
            }

            $("#navicon").addClass("white");
            $("#closeicon").addClass("white");

        } else {
            this.clearRessource();
        }
    },

    initMenu: function() {
        if ($(window).scrollTop() === 0){
            if (this.isMobile){
                $("#ressources").addClass("startanimationm");
            } else {
                $("#ressources").addClass("startanimation");
            }
        } else {
            this.clearRessource();
        }
    },

    init: function() {
        this.determineMobile();
        this.fixIPadHorizontalClick();
    }

};


$(document).ready(function() {
    Reader.init();
});

$('#scrollmarker').waypoint({
    handler: function(direction) {
        if (direction === 'down'){
            Reader.clearRessource();
        } else {
            Reader.clearRessource();
            if (Reader.isMobile){
                $("#ressources").addClass("startanimationm");
            } else {
                $("#ressources").addClass("startanimation");
            }
            $("#titletextbg").show();

        }
    }
});

// listeners

$(window).resize(function() {
    Reader.determineMobile();
    Reader.clearRessource();
});

$(document).click(function(){
   Reader.clearRessource();
});

$("body").click(function(){
   Reader.clearRessource();
});

$("#closeicon").click(function(){
   Reader.clearRessource();
});

$("#nav a").click(function(){
    if (Reader.isMobile) {
        Reader.clearRessource();
    }
});

$("a").click(function(e) {
    e.preventDefault();
    $('html,body').animate({
        scrollTop: $(this.hash).offset().top
    }, 1200);
});

$("#ressources").click(function(e) {
    e.stopPropagation();
});

$('#navicon').click(function(e) {
    Reader.showTableOfContent();
    e.stopPropagation();
});

// Infobox
$('.shortcut').click(function(e) {
    Reader.showGlossar($(this).attr('id'));
    e.stopPropagation();
});

$('.picture').click(function(e) {
    var source = $(this).attr('src');
    var text = $(this).next("figcaption").text();
    Reader.zoomPicture(source, text);
    e.stopPropagation();
});
