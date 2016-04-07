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

    $scope.onSaveClick = function() {
        if ($scope.definition._id) {  // already exists, update!
            console.log("exists! update!");
            definitionService.update({id: $scope.definition._id}, $scope.definition, function() {
                console.log("updating definition successfull!");
                //$location.path('/#/definitions');
            });
        } else {  // doesnt exist, create new!
            console.log("create new!");
            definitionService.save($scope.definition);
        }
        window.location.href = "#/definitions";
 
    };

    $scope.onCreateDefinitionClick = function() {
        window.location.href = "#/definitions/new";  // new doesnt actually work -> just to send an id that doesnt work
    };

  });
