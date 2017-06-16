'use strict'

/**
 * @ngdoc service
 * @name meanMarkdownApp.HTML
 * @description
 * # HTML
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
.service('HTMLService', function (DefinitionService) {

  this.replacePictureGroup = function(page, shortcut, enrichments, tag) {
      //console.log(shortcut);
      if (shortcut.length < 2) {
          console.log("Picturegroup needs at least two pictures.");
          throw Error("Picturegroup needs at least two pictures.");
      }
      var me = this;

      // replace tag with picturegroup div
      var previousHTML = $("#read", page).html();
      $("#read", page).html(previousHTML.replace(tag, "<div class='picturegroup'></div>"));

      // append all picutes to the picture group div

      // get all pictures from shortcut
      var shortcuts = shortcut.split(",");
      shortcuts.forEach(function(shortcut) {
          var picture = shortcut.trim();
          var enrichment = me.findEnrichmentByShortcut(enrichments, picture);
          if (!enrichment) {
              console.log("Picture '" + shortcut + "' not found!");
              //throw Error("Picturegroup needs at least two pictures.");
          } else {
              var pictureString = getPictureString(enrichment);
              $(".picturegroup", page).last().append(pictureString);
          }
      });
  };

})

// private function
