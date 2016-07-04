'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.opmainzedconversion
 * @description
 * # opmainzedconversion
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('OpMainzedConversion', function (Conversion) {

      function OpMainzedConversion() {

        Conversion.call(this, "opMainzed");

        // Public properties
      }

      OpMainzedConversion.prototype.getHtmlFromMarkdown = function (markdown) {
          var customRenderer = new marked.Renderer();

          var h1Counter = 0;
          var h2Counter = 0;
          var h3Counter = 0;
          customRenderer.heading = function (text, level) {

              if (level === 1) {
                  h1Counter++;
                  h2Counter = 0;
                  h3Counter = 0;

                  return '<h1 id="section-' + h1Counter + '">' + text + '</h1>';
              } else if (level === 2) {
                  h2Counter++;
                  h3Counter = 0;
                  return '<h2 id="section-' + h1Counter + "-" + h2Counter + '">' + text + '</h2>';

              } else if (level === 3) {
                  h3Counter++;
                  return '<h3 id="section-' + h1Counter + "-" + h2Counter + "-" + h3Counter + '">' + text + '</h3>';
              }
          };

          // custom link renderer
          customRenderer.link = function (linkUrl, noIdea, text) {
              if (linkUrl.indexOf("#") === 0) {   // internal link
                  return "<a href=\"" + linkUrl + "\" class=\"internal-link\">" + text + "</a>";
              } else {  // external links
                  return "<a href=\"" + linkUrl + "\" class=\"external-link\" target=\"_blank\">" + text + "</a>";
              }

          };
          return marked(markdown, { renderer: customRenderer });
      };

      /**
       * Return the constructor function
       */
      return OpMainzedConversion;
  });
