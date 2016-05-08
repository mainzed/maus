'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:fileSection
 * @description
 * # fileSection
 */
angular.module('meanMarkdownApp')
  .directive('msFilesPanel', function ($filter) {
    return {
        templateUrl: '../views/templates/files-panel.html',
        restrict: 'E',
        //scope: true,  // isolated scope for each instance

        link: function postLink(scope, element, attrs) {
            
            scope.currentFileType = attrs.filetype;

            /**
             * determines if there are files of the user itself or that are public within a group of files.
             * returns false if that is not the case. can be used to hide section headers etc.
             * this only determines if there is a valid file within the group. it doesnt hide private files etc.
             */
            scope.groupHasValidFiles = function(key) {
                var hasValid = false;
                scope.files.forEach(function(file) {
                    if (file.type === key && (file.author === scope.currentUser.name || file.private === false)) {
                        hasValid = true;
                    }
                }); 
                return hasValid;
            };

            /** 
             * uses DateJS to convert mongodb timestamp to nicely formatted string
             */
            scope.getFormattedDate = function(timestamp) {
                var format = "dd.MM.yyyy";

                var date = $filter('date')(timestamp, format);
                var today = $filter('date')(new Date(), format);
                var yesterday = $filter('date')(new Date() - 1, format);

                if (date === today) {
                    return "Heute";
                } else if (date === yesterday) {
                    return "Gestern";
                } else {
                    return date;
                }
            };

            /**
             * requires a query object like { author: some-model }
             */
            scope.setFilter = function(query) {
                if (query["updated_at"]) {
                    var timestamp = query["updated_at"];
                    
                    // 2016-04-18T14:08:49.213Z
                    scope.currentFilter = { updated_at: timestamp.substring(0, 10) };  // ignore time and use date as filter

                } else {
                    scope.currentFilter = query;
                }
            };

            scope.onResetClick = function() {
                scope.currentFilter = undefined;
            };


            //element.text('this is the fileSection directive');
        }
    };
  });
