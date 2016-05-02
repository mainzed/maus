'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PreviewCtrl
 * @description
 * # PreviewCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('PreviewCtrl', function ($scope, $location, HTMLService, temporaryService, fileService, definitionService, cssInjector, AuthService) {  // cssInjector
    
    if (!AuthService.isAuthenticated()) {
        $location.path("/login");
    }

    fitPanelHeight();

    $scope.test = "hello";

  	$scope.file = {};

    $scope.awesomeThings = [1, 2, 3];

    $scope.olatDownloadEnabled = false;  // gets enabled when download is ready

    // keep track of images, links etc

    //console.log($scope.previousChoice);

    // set default value for preview
    /*if (temporaryService.getChoice()) {
        $scope.choice = temporaryService.getChoice();
    } else {
        $scope.choice = "OLAT";
        temporaryService.setChoice($scope.choice);
    }*/

    // set choice based on filetype
    if (temporaryService.getType()) {
        $scope.choice = temporaryService.getType();
    }
    

    // fills title, id and markdown if cookie exists
    //temporaryService.getCookies();

    if (temporaryService.getMarkdown().length > 0) {  // markdown exists

        HTMLService.getOlat(false, function(html) {
            // success
            //console.log(html);
            $scope.html = html;
            $scope.olatDownloadEnabled = true;  // enable when html fully loaded
        });

    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    

	$scope.onOlatClick = function() {

        // get current filename
        var id = temporaryService.getCurrentFileId();
        
        if (id === -1) {
            startDownload("export.html"); 
        } else {
            console.log("found name!");
            fileService.get({id: id}, function(file) {
                startDownload(file.title.replace(" ", "-") + ".html");           
            });
        }
        
    };

    $scope.onEditorClick = function() {
        $location.path("/editor");
    };
  	
    function startDownload(filename) {
        var content =   "<html>\n" +
                        "  <head>\n" +
                        '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
                        '<link rel="stylesheet" href="style/olat.css" />\n' +
                        "  </head>\n"+
                        "  <body>\n" +
                        $scope.html +
                        "<script src=\"https://code.jquery.com/jquery-2.2.3.min.js\"></script>\n" +
                        "<script src=\"javascript/olat.js\"></script>\n" +
                        "  </body>\n"+
                        "</html>\n";

        // trigger download
        var blob = new Blob([content], { type:"data:text/plain;charset=utf-8;" });           
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', window.URL.createObjectURL(blob));
        downloadLink.attr('download', filename);
        downloadLink[0].click();  

    }

    $scope.onPdfClick = function(divId) {

        var doc = new jsPDF();
        doc.fromHTML($("#" + divId).html(), 15, 15, {
            'width': 170
        });

        doc.save(divId + '.pdf');
    };

    function getDefinitionByName(word) {
        var definitions = definitionService.query();
        
        definitions.forEach(function(definition) {
            if (definition.word === word) {
                return definition;
            }
        });
    }

    // replace map-images with openlayersmap
    function replaceMaps() {

        //<div id="map" class="map"></div>

        /*$('img[alt="map-1"]').load(function() {
            Pixastic.process(img, "desaturate", {average : false});
        });*/
        console.log("adding maps!");
        var map = new ol.Map({
            target: 'map',
            layers: [
              new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'sat'})
              })
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([37.41, 8.82]),
              zoom: 4
            })
        });
    }
    

    // triggers when choice changes
    // dynamically adds and removes css styles according to preview choice
    $scope.$watch('choice', function (newValue, oldValue) {
        if (newValue === "OLAT") {
            cssInjector.disable("/styles/normal.css");
            cssInjector.add("/styles/olat.css");
        } else if (newValue === "Bootstrap") {
            cssInjector.disable("/styles/olat.css");
            cssInjector.add("/styles/normal.css");
        } else {
            cssInjector.disable("/styles/olat.css");
            cssInjector.disable("/styles/normal.css");
        }

        // remember
        temporaryService.setChoice(newValue);
    });

    /*$(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.shiftKey && code === 80) { // Crel + P 

           window.location.href = "/#/editor";
        }
    });*/

  
    $(window).resize(function () {
        fitPanelHeight();
    });

    function fitPanelHeight() {
        var height = window.innerHeight - 54 - 10;
        $(".nano").css("height", height); 
    }

  });


