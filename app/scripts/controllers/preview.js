'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PreviewCtrl
 * @description
 * # PreviewCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('PreviewCtrl', function ($scope, temporaryService, fileService, definitionService, cssInjector) {  // cssInjector

    $scope.test = "hello";

  	$scope.file = {};

    $scope.awesomeThings = [1, 2, 3];

    // fills title, id and markdown if cookie exists
    temporaryService.getCookies();

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

        // custom image renderer
        var images = []; // save images here to use them for the images-table
        var counter = 0;
        customRenderer.image = function (src, title, alt) {
            // used title attr for caption, author etc
            var tokens = title.split(", ");
            var caption = tokens[0];
            var source = tokens[1];
            var author = tokens[2];
            var license = tokens[3];
            var title = alt;

            // not needed for rendering, but to access them later
            images.push({
                source: source,
                caption: caption,
                author: author,
                license: license,
                title: title
            });
            //var html = "";

            return "<figure>\n" + 
                    "<img src=\"" + src + "\" alt=\"" + alt + "\">" +
                    "<figcaption>\n" + 
                    caption + " (Quelle: " + source + ", Autor: " + author + " © " + license + ")\n" +
                    "</figcaption>\n" + 
                    "</figure>\n";
        };

        // change renderer to export figure instead of img + em
        // <figure>
        // <img src="img_pulpit.jpg" alt="The Pulpit Rock" width="304" height="228">
        // <figcaption>Fig1. - A view of the pulpit rock in Norway.</figcaption>
        // </figure>

		// create OLAT
		var markdown = temporaryService.getMarkdown();

 		var html = marked(markdown, { renderer: customRenderer });
 
        html = replaceStoryTags(html);

 		$scope.html = html;

        // appends tables after last definition was changed
        replaceDefinitionTags($scope.html);
        
        appendLinkTable($scope.html);

        // add table of images
        //var images = getImages($scope.html);
        //console.log(images);
        $scope.html += createImagesTable(images);

    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    
    function replaceDefinitionTags() {
        // convert definitions
        // convert definition
        var words = $scope.html.match(/\{(.*?)\}/g);

        if (words) {
            //console.log(words.length);
            words.forEach(function(word, index) {
                //console.log("index: " + index);
                
                //word = word.replace("{", "").replace("}", "");
                
                var definitions = definitionService.query(function() {
                    definitions.forEach(function(definition) {
                        
                        if (definition.word === word.replace("{", "").replace("}", "")) {
                            //console.log(definition.word);
                            //console.log($scope.html);
                            var snippet = "<a href=\"" + definition.url +  "\" title=\"" + definition.text + "\">" + definition.word + "</a>";
                            var html = $scope.html;
                            //console.log("replacing: " + word + " with: " + snippet);
                            
                            //console.log(html.replace(word, snippet));
                            //console.log($scope.html);
                            //console.log(word);
                            // convert to anchors
                            $scope.html = html.replace(word, snippet);
                            //console.log($scope.html);

                            // TODO: gets run again for evey word, unneccessary
                            //console.log("append tables!");
                            //appendTables($scope.html);
                        
                            // on last word -> create definitions table
                            //console.log(index + " of " + words.length);
                            if (index === words.length - 1) {  // last word
                                
                                //console.log(word + " is last word!");

                                var links = getLinks($scope.html);
                                //console.log(links);
                                if (links.length) {
                                    
                                    var definitionsTable = createDefinitionsTable(links);
                                    $scope.html += definitionsTable;
                                }

                            }
                        }
                    });

                });
            });    
        }
    }

    // replaces opening and closing $ tags with a wrapping div
    // for slides -> use counter to keep track of slide-ids
    function replaceStoryTags(html) {
        //var reg = new RegExp(/§\{([\s\S]*?)\}/, "g");
        //var stories = markdown.match(reg);  // store them for later

        return html.replace(/<p>story{/g, '<div class="story">').replace(/}story<\/p>/g, "</div>");
        //html = html.replace(/\n§{/g, '<div class="story">');
    } 

    function appendLinkTable(html) {
        var links = getLinks(html);
        //console.log(html);
        //console.log(links);
        if (links.length) {
            var linksTable = createLinksTable(links);
            //var definitionsTable = createDefinitionsTable(links);
            $scope.html = html + linksTable;  // + definitionsTable;
        }
    }

    // returns html containing table of links
    // requires array containing link objects
	function createLinksTable(links) {
		var counter = 0;
		var html = "";
		html += "<div class=\"links-table\"><h4>Links</h4><ul>";
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
        //console.log(html);
		if (counter < 1) {
			return "";
		} else {
			return html;
		}
	}

	function createDefinitionsTable(links) {
		var counter = 0; 
        var wordsInTable = [];  // skip duplicates
		var html = "";
		html += "<div class=\"definitions-table\"><h4>Definitions</h4><ul>";
		for (var key in links) {
			var link = links[key];
			var tooltip = link[3];
			var word = link[2];
			var url = link[1];

            // skip links without title attribute (tooltip) and
            // definitions already in table
			if (tooltip && wordsInTable.indexOf(word) < 0) {  
				html += "<li>" + word + ": " + tooltip + "</li>\n";
				wordsInTable.push(word);
                counter++;
			}
		}
		html += "</ul>\n</div>";

		var result = "";
		if (counter > 0) {
            result = html;
		}
        return result;
	}

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

    /**
     * returns a html div element containing and 
     * unordered list with all images. 
     * requires a list of image objects
     */
    function createImagesTable(images) {
        var html = "<div class=\"images-table\">\n<h4>Images</h4>\n<ul>";
        if (images.length) {

            // create html
            images.forEach(function(image) {
                html += "<li>" + 
                        image.title + ", " +  
                        image.author + ", " +  
                        image.license + ", " +  
                        "</li>";
            });
        }
        html += "</ul>\n</div>\n";
        return html;
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
  	
    function startDownload(filename) {
        var content =   "<html>\n" +
                        "  <head>\n" +
                        '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
                        '<link rel="stylesheet" href="style/olat.css" />\n' +
                        "  </head>\n"+
                        "  <body>\n" +
                        $scope.html + 
                        "  </body>\n"+
                        "</html>\n";

        // trigger download
        var blob = new Blob([content], { type:"data:text/plain;charset=utf-8;" });           
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', window.URL.createObjectURL(blob));
        downloadLink.attr('download', filename);
        downloadLink[0].click();  
    }

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


