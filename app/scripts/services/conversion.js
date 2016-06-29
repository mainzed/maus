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

    function Conversion(filetype) {
      // Public properties
      this.filetype = filetype;

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



    /**
     * Return the constructor function
     */
    return Conversion;
  });
