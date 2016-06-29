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

        Conversion.call("opMainzed");

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
      return OpMainzedConversion;
  });
