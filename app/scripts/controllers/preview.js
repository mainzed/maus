'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PreviewCtrl
 * @description
 * # PreviewCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('PreviewCtrl', function ($scope, temporaryService, definitionService, cssInjector) {

  	$scope.file = {};
    

    if (temporaryService.getMarkdown().length > 0) {  // markdown exists

    	// convert markdown
		var customRenderer = new marked.Renderer();

		// custom heading renderer
		var counter = 0;
		customRenderer.heading = function (text, level) {
		 	var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
		 	counter++;

		  	return '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>';
		};




		// create OLAT
		var markdown = temporaryService.getMarkdown();

 		var html = marked(markdown, { renderer: customRenderer });
 		
 		$scope.html = html;


 		

        // convert definitions
        // convert definition
        var words = $scope.html.match(/\{(.*?)\}/g);
        if (words) {
            words.forEach(function(word) {
                
                //word = word.replace("{", "").replace("}", "");
                
                var definitions = definitionService.query(function() {
                    definitions.forEach(function(definition) {
                        
                        if (definition.word === word.replace("{", "").replace("}", "")) {
                            //console.log($scope.html);
                            var snippet = "<a href=\"" + definition.url +  "\" title=\"" + definition.text + "\">" + definition.word + "</a>";
                            var html = $scope.html;
                            //console.log("replacing: " + word + " with: " + snippet);
                            
                            //console.log(html.replace(word, snippet));

                            // convert to anchors
                            $scope.html = html.replace(word, snippet);

                            //
                        }
                    });

                });


                //var definitionObject = getDefinitionByName(definition);
                //console.log(definitionObject);
            });    
        }

        // if links exist, create table of links
        var links = getLinks(html);
        //console.log(html);
        //console.log(links);
        if (links.length) {
            console.log(links);
            var linksTable = createLinksTable(links);
            var definitionsTable = createDefinitionsTable(links);
            $scope.html = html + linksTable + definitionsTable;
        }
 		


    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    
    // returns html containing table of links
    // requires array containing link objects
	function createLinksTable(links) {
		var counter = 0;
		var html = "";
		html += "<div id='links-table'>Links\n<ul>\n";
		for (var key in links) {
			var link = links[key];
			var title = link[3];
			var text = link[2];
			var url = link[1];
			if (!title && url !== "definition") {  // skip links with titles (definitions)
				html += "<li><a href='" + url + "'>" + text + "</a></li>\n";
				counter++;
			}
		}
		html += "</ul>\n</div>";

		if (counter < 1) {
			return "";
		} else {
			return html;
		}
	}

	function createDefinitionsTable(links) {
		var counter = 0; 
		var html = "";
		html += "<div id='definitions-table'>Definitions\n<ul>\n";
		for (var key in links) {
			var link = links[key];
			var title = link[3];
			var text = link[2];
			var url = link[1];
			if (url === "definition") {  // skip links with titles (definitions)
				html += "<li><a href='" + url + "'>" + text + "</a></li>\n";
				counter++;
			}
		}
		html += "</ul>\n</div>";

		
		if (counter < 1) {
			return "";
		} else {
			return html;
		}
	}

	/**
	 * returns an array that contains all links
	 */
	/*function getLinksFromMarkdown() {
		var links = [];
		var markdown = temporaryService.getMarkdown();	
		var matches = markdown.match(/\[(.*?)\)/g);  // 'g' makes it return all matches
	
		// TODO: skip images
		
		if (matches) {
			matches.forEach(function(link){
				var linkTitle = link.match(/\[([^)]+)\]/g);
				console.log(linkTitle);

				var linkUrl = link.match(/\(([^)]+)\)/g);
				console.log(linkUrl);
				links.push({
					title: linkTitle,
					url: linkUrl
				});
			});
		}
		return links;
	}*/

	function getLinks(html) {
	    var container = document.createElement("p");
	    container.innerHTML = html;

	    var anchors = container.getElementsByTagName("a");
	    var list = [];

	    for (var i = 0; i < anchors.length; i++) {
	        var href = anchors[i].href;
	        var title = anchors[i].title;
	        var text = anchors[i].textContent;

	        if (text === undefined) text = anchors[i].innerText;

	        list.push(['<a href="' + href + '">' + text + '</a>', href, text, title]);
	    }

	    return list;
	}

	$scope.onOlatClick = function() {
		console.log("trigger!");
        if (temporaryService.getMarkdown().length > 0) {
            //var html = marked(temporaryService.getMarkdown());
            $scope.html = html;
            console.log($scope.html);
            if (html !== undefined) {

                
                // attach body to html
                var content =   "<html>\n" +
                                "  <head>\n" +
                                '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
                                '<link rel="stylesheet" href="style/olat.css" />\n' +
                                "  </head>\n"+
                                "  <body>\n" +
                                html + 
                                "  </body>\n"+
                                "</html>\n";


                // trigger download
	            var blob = new Blob([content], { type:"data:text/plain;charset=utf-8;" });           
	            var downloadLink = angular.element('<a></a>');
	            downloadLink.attr('href', window.URL.createObjectURL(blob));
	            downloadLink.attr('download', 'export.html');
	            downloadLink[0].click();

            }

        } else {
            console.log("no markdown available! start editing something or choose existing file");
        }

    };
  	
    function getDefinitionByName(word) {
        var definitions = definitionService.query();
        
        definitions.forEach(function(definition) {
            if (definition.word === word) {
                return definition;
            }
        });
    }

    // triggers when choice changes
    // dynamically adds and removes css styles according to preview choice
    $scope.$watch('choice', function (newValue, oldValue) {
        if (newValue === "OLAT") {
            cssInjector.add("/styles/olat.css");
        } else {
            cssInjector.disable("/styles/olat.css");
        }
    });

    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.shiftKey && code === 80) { // Crel + P 

           window.location.href = "/#/editor";
        }
    });

  });


