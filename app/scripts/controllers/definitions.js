'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:DefinitionsCtrl
 * @description
 * # DefinitionsCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('DefinitionsCtrl', function ($scope, $routeParams, $location, definitionService, temporaryService) {
    $scope.definitions = definitionService.query();

    $scope.awesomeThings = [1, 2, 3];

    // used to get definition by id -> for definition_details!
    $scope.getDefinition = function() {
        var id = $routeParams.id;
        definitionService.get({id: id}, function(definition) {
            $scope.definition = definition;
        });

        // for new creation
        if (!$scope.definition) {
            $scope.definition = {};
        }
    };

  });
