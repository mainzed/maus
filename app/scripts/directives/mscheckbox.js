'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msCheckboxes
 * @description
 * # msCheckboxes
 */
angular.module('meanMarkdownApp')
  .directive('msCheckbox', function () {
    return {
        template: '<span>\n' + 
                '<i ng-show="checked === false" class="fa fa-square-o" aria-hidden="true" ng-click="checked = true"></i>\n' +
                '<i ng-show="checked === true" class="fa fa-check-square-o" aria-hidden="true" ng-click="checked = false"></i>\n' +
                '</span>',
        restrict: 'E',
        scope: {
            ngModel: '='
        },
        link: function postLink(scope, element, attrs) {
            
            // set check when ngModel already has a value
            scope.$apply(function() {
                scope.checked = scope.ngModel;
            });

            // detect click event on one of the icons
            element.bind('click', function() {

                // set ng-model value to checked value
                scope.$apply(function() {
                    scope.ngModel = scope.checked;
                });

                
            });

        }
    };
  });

