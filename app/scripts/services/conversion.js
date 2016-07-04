'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.conversion
 * @description
 * # conversion
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('Conversion', function () {

    function Conversion(filetype, markdown) {
      // Public properties
      this.filetype = filetype;
      this.markdown = markdown;

      //this.title = "";

      this.page = $('<div></div>');
    }

    /**
     * Public method, assigned to prototype
     */
    Conversion.prototype.init = function () {

      //return this.firstName + ' ' + this.lastName;
    };

    Conversion.prototype.appendToPage = function (content) {
      this.page.append(content);
    };

    Conversion.prototype.getHtml = function () {
      return this.page.html();
    };

    Conversion.prototype.getMetadata = function() {

        var markdown = this.markdown;

        // extract metadata from markdown
        var matches;
        matches = markdown.match(/^@title:(.*)/);
        if (matches) {
            result.title = matches[1].trim();  // save
            markdown = markdown.replace(matches[0] + "\n", "");  // remove

        }
        matches = markdown.match(/^@author:(.*)/);
        if (matches) {
            result.author = matches[1].trim();
            markdown = markdown.replace(matches[0] + "\n", "");
        }

        matches = markdown.match(/^@created:(.*)/);
        if (matches) {
            result.created = matches[1].trim();
            markdown = markdown.replace(matches[0] + "\n", "");
        }

        matches = markdown.match(/^@updated:(.*)/);
        if (matches) {
            result.updated = matches[1].trim();
            markdown = markdown.replace(matches[0] + "\n", "");
        }

        matches = markdown.match(/^@cover-description:(.*)/);
        if (matches) {
            result.coverDescription = matches[1].trim();
            markdown = markdown.replace(matches[0] + "\n", "");
        }

        this.markdown = markdown;
        //console.log(result);
        //return result;
    };



    /**
     * Return the constructor function
     */
    return Conversion;
  });
