var is_iPad = navigator.userAgent.match(/iPad/i) != null;

// global var
var mobile = false;

$(document).ready(function() {

    //$("html").niceScroll();

    //lazyload
    /*
    $("img").lazyload({
        threshold : 200
    });
    */
    
    // initScroller();
    $("#read").addClass("readnoshift");
    checkBrowserWidth();
    console.log( $(window).scrollTop());


        

    // initialize menu
    if($(window).scrollTop() == 0){
        if(mobile){
            $("#ressources").addClass("startanimationm");
        } 
        else {
            $("#ressources").addClass("startanimation");
        }
    }
    else {
        clearRessource();
    }


    // Ipad Horizontal Background Click Fix
    if(is_iPad){$("*").css("cursor", "pointer");}

        


    // Waypoints - Ein- und Ausblenden von Ressourcen
    $('#scrollmarker').waypoint({
        handler: function(direction) {
            if (direction == 'down'){
                if ( !$( "#ressources" ).hasClass( "showdefinitions" ) ) {
                clearRessource();
                }
            }
            else {
                showTitle();
            }
        }
    })    


    // animierter Ankerlink
    /*
    $('a').click(function(){
        $('body, html').animate({
            scrollTop: $( $(this).attr('href') ).offset().top
        }, 1200);
        return false;
    });
    */
  
 

}); //close ready

    $( window ).resize(function() {
        checkBrowserWidth(); 
        resetLayout();
        
    });


  $("a:not(.external-link)").click(function(event){     
        event.preventDefault();
        console.log($(this.hash).offset().top);
        var scrollspeed = 1200;
        if($(window).scrollTop() - $(this.hash).offset().top < 1000){
            console.log("small");
            scrollspeed = 600;
        }
        $('html,body').animate({scrollTop:$(this.hash).offset().top}, scrollspeed);
    });




    
    

    $("#ressources").click(function(e){
        e.stopPropagation();
    });


    $(document).click(function(){
       clearRessource();
    });

    $("body").click(function(){
       clearRessource();
    });

    $("#closeicon").click(function(){
       clearRessource();
    });

    $("#nav a").click(function(){
        if(mobile == true){
            clearRessource();
        }
    });

    $('#navicon').click(function(e){
        showTableOfContent();
        e.stopPropagation();
    });


    // Infobox
    $('.shortcut').click(function(e){
        showGlossar($(this));
        e.stopPropagation();
    });

    
    $('.picture').click(function(e){
        zoomPicture($(this));
        e.stopPropagation();
    });

function checkBrowserWidth(){

    var browserwidth = $( document ).width();
    if (browserwidth < 801){
        mobile = true;
    }
    else {
        mobile = false;
    }
}  

function resetLayout(){
    var currentclass = $("#ressources").attr("class");
    if(mobile){
        if(currentclass.slice(-1) != "m" && currentclass != "showtableofcontent"){
            currentclass = currentclass + "m";
            $("#ressources").removeClass();
            $("#ressources").addClass(currentclass);
        }
        $("#read").removeClass("shiftread");
    }
    else {
        if(currentclass.slice(-1) == "m" || currentclass == "showtableofcontent"){
            if(currentclass == "showtableofcontent"){
                $("#ressources").removeClass();
                $("#ressources").addClass("showdefinitions");
                $("#read").addClass("shiftread");
            }
            else {
                currentclass = currentclass.substring(0, currentclass.length - 1);
                $("#ressources").removeClass();
                $("#ressources").addClass(currentclass);
            }
        }
    }
}  
    


function showTitle(){

   clearRessource();
    if(mobile){
        $("#ressources").addClass("startanimationm");
    } 
    else {
        $("#ressources").addClass("startanimation");
    }
    $("#titletextbg").show();
   
}





function clearRessource(){
    
    // remove classes
    $("#ressources").removeClass();
    $("#navicon").removeClass();
    $("#closeicon").removeClass();
    $(".activeressource").removeClass("activeressource");
    $(".shiftread").removeClass("shiftread");
    $("#read").addClass("readnoshift");


    // clear content
    $("#ressourcestext").text("");
    $("#ressources img").remove();
    $(".figcaption").remove();
    $("#titletextbg").hide();
    $("#imagecontainer").hide();  
    $("#gradient").hide();

    // hide navigation elements
    $("#nav").hide();
    $("#closeicon").hide();
    

    if(mobile){
        $("#ressources").addClass("minifiedm");
    } 
    else {
        $("#ressources").addClass("minified");
    }
    $("#navicon").show();
}

function resetRessource(navicon, nav, closeicon){
    
    // remove classes
    $("#ressources").removeClass();
    $("#navicon").removeClass();
    $("#closeicon").removeClass();
    $(".activeressource").removeClass("activeressource");
    $(".shiftread").removeClass("shiftread");
    $("#read").addClass("readnoshift");
    $("#titletextbg").hide();
    $("#imagecontainer").hide();  

    // clear content
    $("#ressourcestext").text("");
    $("#ressources img").remove();
    $(".figcaption").remove();
    $("#gradient").hide();

    // nav elements
    if(navicon){
        $("#navicon").show();
    }
    else {
        $("#navicon").hide();
    }
    if(nav){
        $("#nav").show();
    }
    else {
        $("#nav").hide();
    }
     if(closeicon){
        $("#closeicon").show();
    }
    else {
        $("#closeicon").hide();
    }
}


function showTableOfContent(){
     
    resetRessource(false, true, true);
    if(mobile){
        $("#ressources").addClass("showtableofcontent");
        $("#gradient").show();
    } 
    else {
        $("#ressources").addClass("showdefinitions");
        $("#read").removeClass("readnoshift");
        $("#read").addClass("shiftread");

        //$("#nav").scrollTop( 300 );
    }

    // set active layer
    $(".activeressource").removeClass("activeressource");
    $("#nav").addClass("activeressource");

     $('#nav').animate({scrollTop:$(".active").offset().top}, 1200);
  
}

function showGlossar(clickedword){
    
    resetRessource(false, false, true);

    // find tooltip text
    var identifier = clickedword.attr('id');            
    $("." + identifier).clone().appendTo("#ressourcestext");
    
    
    if(mobile){
        $("#ressources").addClass("showdefinitionsm");
        $("#gradient").show();
    } 
    else {
        $("#ressources").addClass("showdefinitions");
        $("#read").removeClass("readnoshift");
        $("#read").addClass("shiftread");
    }

    // set active layer
    $(".activeressource").removeClass("activeressource");
    $("#ressourcestext").addClass("activeressource");
              
    
    
    if(mobile==false){
        $("#navicon").show();
    } else {
        $("#navicon").hide();
    }
}

function zoomPicture(clickedpicture){
    if(!mobile){
        resetRessource(true, false, true);
        var source = clickedpicture.attr('src');     
        var figcaption = $('<p class="figcaption">' + clickedpicture.next("figcaption").text() + '</p>');      
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
       
    }
    else {
        clearRessource();
    }
}

/*
function initScroller() {
                var anchor = document.getElementsByTagName("a");
                for (var i=0; i<anchor.length; ++i) {
                    anchor[i].onclick = Scroller;
                }
            }
*/        