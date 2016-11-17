// code is based on the example found on
// http://stackoverflow.com/questions/9979827/change-active-menu-item-on-page-scroll

// Cache selectors
var topMenu = $("#nav"),
    // All list items
    menuItems = topMenu.find("a"),
    // Anchors corresponding to menu items
    scrollItems = menuItems.map(function(){
      var item = $($(this).attr("href"));
      if (item.length) { return item; }
    });


$(window).scroll(function(){
   // Get container scroll position
   var fromTop = $(this).scrollTop() + 100;

   // Get id of current scroll item
   var cur = scrollItems.map(function(){
     if (($(this).offset().top) < fromTop)
       return this;
   });

   // Get the id of the current element
   cur = cur[cur.length-1];
   var id = cur && cur.length ? cur[0].id : "";

   // Set/remove active class
   menuItems.removeClass("active");
   menuItems.filter("[href='#"+id+"']").addClass("active");
   
})