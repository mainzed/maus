'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:fileSection
 * @description
 * # fileSection
 */
angular.module('meanMarkdownApp')
  .directive('filesection', function () {
    return {
        templateUrl: '../views/templates/filesection.html',
        restrict: 'E',
        scope: true,  // isolated scope for each instance

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
                    if (file.type === key && (file.author === scope.currentUser || file.private === false)) {
                        hasValid = true;
                    }
                }); 
                return hasValid;
            };

            //console.log(Date.today());
            //console.log(Date.today().add(-1).day());

            /** 
             * uses DateJS to convert mongodb timestamp to nicely formatted string
             */
            scope.getFormattedDate = function(timestamp) {
                var format = 'dd.MM.yyyy';
                var date = Date.parse(timestamp).toString(format);
                var today = Date.today().toString(format);
                var yesterday = Date.today().add(-1).days().toString(format);

                if (date === today) {
                    return "Heute";
                } else if (date === yesterday) {
                    return "Gestern";
                } else {
                    return date;
                }
                
            };


            //element.text('this is the fileSection directive');
        }
    };
  });
