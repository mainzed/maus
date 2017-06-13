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
  /**
   * generates OLAT html from markdown. provides a callback with the generated
   * HTML as parameter
   */
    // TODO: dont require file, but create EditorService
  this.getOlat = function (file, definitions, config) {

    config = config || {
      addTitle: false,
      addContentTable: false,
      addDefinitionsTable: false,
      addImagesTable: false
    }


    this.replaceEnrichmentTags(page, definitions);

  }

  /**
   * requires html and definitions from the database
   */
  this.replaceEnrichmentTags = function(page, enrichments) {
      var me = this;
      //var enrichment;

      // reset used definitions
      //usedDefs = [];
      var usedEnrichments = [];

      // get all tags
      var tags = $(page).html().match(/\{(.*?)\}/g);

      // loop through all tags
      if (tags) {
          tags.forEach(function(tag) {
              // bracket content
              var content = tag.replace("{", "").replace("}", "");

              // extract category keyword and shortcut
              var category;
              var shortcut;

              if (content.split(":").length > 1) {
                  category = content.split(":")[0].trim();
                  shortcut = content.split(":")[1].trim();
              } else {
                  // legacy support: when no category/keyword is given
                  // it is assumed that it is a definition
                  category = "definition";
                  shortcut = content;
              }

              //var snippet;
              var enrichment;

              if (category === "picturegroup") {
                  me.replacePictureGroup(page, shortcut, enrichments, tag);

              } else if (category === "picture") {
                  enrichment = me.findEnrichmentByShortcut(enrichments, shortcut);
                  if (enrichment) {
                      me.replacePicture(tag, page, enrichment);
                  }

              } else if (category === "citation") {
                  // TODO: configure in filetypes what enrichments are available for
                  // each filetype
                  enrichment = me.findEnrichmentByShortcut(enrichments, shortcut);
                  if (enrichment) {
                      me.replaceCitation(page, enrichment, tag);
                  }

              } else if (category === "definition") {
                  me.replaceDefinition(page, shortcut, tag, enrichments, usedEnrichments);

              } else if (category === "story") {

                  enrichment = me.findEnrichmentByShortcut(enrichments, shortcut);
                  if (enrichment) {
                      me.replaceStory(page, enrichment, tag);
                  }

              }

          });
      }
      return;
  };

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

  this.replacePicture = function(tag, page, enrichment) {
    if (enrichment.filetype !== "opMainzed") {
        console.log("filetype " + enrichment.filetype + "currently does not support picture tags");
        //throw Error("filetype " + enrichment.filetype + "currently does not support picture tags");
    }

    var pictureString = getPictureString(enrichment);

    // replace tag with newly created HTML
    var currentHTML = $("#read", page).html();
    $("#read", page).html(currentHTML.replace(tag, pictureString));
  }
})

// private function
function getPictureString (enrichment) {
  var figureString;
  var authorString = "";
  var licenseString = "";
  var metadataString = "";

  if (enrichment.author) {
      authorString = '<span class="author">Autor: ' + enrichment.author + '</span>';
  }

  if (enrichment.license) {
      licenseString = '<span class="license">Lizenz: ' + enrichment.license + '</span>';
  }

  if (!enrichment.title) {
      console.log("missing image alt attribute");
      enrichment.title = "picture";
  }

  if (authorString || licenseString) {
      metadataString = [
          '<div class="picture-metadata">',
              authorString,
              licenseString,
          '</div>'
      ].join("");
  }

  figureString = [
      '<figure id="' + enrichment._id + '">',
          '<img src="' + enrichment.url + '" class="picture" alt="' + enrichment.title + '">',
          '<figcaption>',
              enrichment.text,
              metadataString,
          '</figcaption>',
      '</figure>'
  ].join("");

  return figureString;
}
