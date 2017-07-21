 $(document).ready(function() {


 	// Zoom Picture
 	$('figure').click(function(){
 		if($(this).hasClass("big")){
 			$(this).removeClass("big");
 		}
 		else {
			$(this).addClass("big");
		}
 	});


 	// Tooltip
	$('.definition').hover(function(e){

	        var title = $(this).attr('title');
	        var text = $(this).text();
	        $(this).data('tipText', title).removeAttr('title');
	        var headline = $("<h4>" + text + "</h4></br>");
	        $('<div class="tooltip"></div>').text(title).appendTo('body');
	        $('.tooltip').prepend(headline);

	}, function() {

	        $(this).attr('title', $(this).data('tipText'));
	        $('.tooltip').remove();
	});



	$('a').click(function(){
	    $('body, html').animate({
	        scrollTop: $( $(this).attr('href') ).offset().top
	    }, 800);
    	return false;
	});





}); //close ready
