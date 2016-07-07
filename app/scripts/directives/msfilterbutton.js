'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msFilterButton
 * @description when a filter is active, show that in a filter and make it
 * clickable, so it can reset the filter.
 * # msFilterButton
 */
angular.module('meanMarkdownApp')
    .directive('msFilterButton', function () {
        return {
            template: '<button ng-show="currentFilter" type="button" class="btn btn-default filterbutton grotesk" ng-click="onFilterResetClick()"><i class="fa fa-times" aria-hidden="true"></i>{{ buttonContent }}</button>',
            restrict: 'E',

            controller: ['$scope', function($scope) {
                $scope.$watch('currentFilter', function(currentFilter) {
                    if (currentFilter) {  // only show button when filter exists
                        if (currentFilter.author) {
                            $scope.buttonContent = "author: " + currentFilter.author;
                        } else if (currentFilter.private) {
                            $scope.buttonContent = "private: " + currentFilter.private;
                        } else if (currentFilter.updatedAt) {
                            $scope.buttonContent = "date: " + currentFilter.updatedAt;
                        }
                    }
                });

                $scope.onFilterResetClick = function() {
                    $scope.currentFilter = false;
                };

            }]
        };
    });
