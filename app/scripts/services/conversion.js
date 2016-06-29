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
    }

    /**
     * Public method, assigned to prototype
     */
    /*User.prototype.getFullName = function () {
      return this.firstName + ' ' + this.lastName;
  };*/

    /**
     * Return the constructor function
     */
    return Conversion;
  });
