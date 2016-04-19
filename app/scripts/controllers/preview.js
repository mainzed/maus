'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PreviewCtrl
 * @description
 * # PreviewCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('PreviewCtrl', function ($scope, $location, temporaryService, fileService, definitionService, cssInjector) {  // cssInjector
    fitPanelHeight();

    $scope.test = "hello";

  	$scope.file = {};

    $scope.awesomeThings = [1, 2, 3];

    $scope.olatDownloadEnabled = false;  // gets enabled when download is ready

    //console.log($scope.previousChoice);

    // set default value for preview
    if (temporaryService.getChoice()) {
        $scope.choice = temporaryService.getChoice();
    } else {
        $scope.choice = "OLAT";
        temporaryService.setChoice($scope.choice);
    }
    

    // fills title, id and markdown if cookie exists
    //temporaryService.getCookies();

    if (temporaryService.getMarkdown().length > 0) {  // markdown exists

    	// convert markdown
		var customRenderer = new marked.Renderer();

		// custom heading renderer
        var headings = [];
		var counter = 0;
		customRenderer.heading = function (text, level) {
            counter++;
		 	var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

            headings.push({
                text: text,
                level: level,
                counter: counter
            });

		  	return '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>';
		};

        // custom image renderer
        var images = []; // save images here to use them for the images-table
        var counter = 0;
        customRenderer.image = function (src, title, alt) {
            // used title attr for caption, author etc
            var tokens = title.split("; ");
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

            return '<figure id="' + alt + '">\n' + 
                    "<img src=\"" + src + "\" alt=\"" + alt + "\">" +
                    "<figcaption>\n" + 
                    "<a href=\"#images-table\">\n" + 
                    caption + " (Quelle: " + source + ", Autor: " + author + " © " + license + ")\n" +
                    "</a>\n" +
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
        
        createOlatHtml(html);

        //createBootstrapHtml(html); 

    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    
    function createOlatHtml(html) {
        html = replaceStoryTags(html);
        
        $scope.html = html;

        replaceDefinitionTags($scope.html);
        
        appendLinkTable($scope.html);

        // add table of images to end of file
        $scope.html += createImagesTable(images);

        // add table of content to beginning of file
        $scope.html = createTableOfContent(headings) + $scope.html;

        // add title to beginning of filee
        var title = temporaryService.getTitle();

        $scope.html = createPageTitle(title) + $scope.html;

    }

    function createBootstrapHtml(html) {
        $scope.html = html;
         // add table of content to beginning of file
        $scope.html = createTableOfContent(headings) + $scope.html;

        // add title to beginning of filee
        var title = temporaryService.getTitle();
        $scope.html = createPageTitle(title) + $scope.html;
    }

    function replaceDefinitionTags() {
        // convert definitions
        // convert definition
        var words = $scope.html.match(/\{(.*?)\}/g);
        
        if (words) {
            //console.log(words.length);
            var defs = {};  // keep track of definitions
            words.forEach(function(word, index) {
                //console.log("index: " + index);
                
                //word = word.replace("{", "").replace("}", "");
                
                var definitions = definitionService.query(function() {
                    definitions.forEach(function(definition) {

                        var content = word.replace("{", "").replace("}", ""); // bracket content 
                        var mainWord;  // e.g. Geld
                        var extraWord;
                        // check if extra word was used {Cash: Money} instead of {Money}
                        if (content.indexOf(":") > -1) {  // defferent word was used 
                            extraWord = content.split(":")[0];
                            mainWord = content.split(":")[1].trim();
                        } else {  // normal mode
                            mainWord = content;
                        }
                        
                        if (definition.word === mainWord) {
                            var snippet;
                            if (extraWord) {  // use extra word as link
                                snippet = "<a href=\"#definitions-table\" title=\"" + definition.text + "\" class=\"definition\">" + extraWord + "</a>";
                            } else {  // use definition mai word as link
                                snippet = "<a href=\"#definitions-table\" title=\"" + definition.text + "\" class=\"definition\">" + definition.word + "</a>";
                            }
                            
                            var html = $scope.html;

                            $scope.html = html.replace(word, snippet);
                            //console.log($scope.html);
                            
                            /*if (defs.indexOf(definition) === -1) {  // skip duplicates
                                console.log(defs.indexOf(definition));
                                defs.push(definition);
                            }*/
                            if (!defs.hasOwnProperty(definition.word)) {  // skip duplicates
                                defs[definition.word] = definition;
                            }
                            

                            // TODO: gets run again for evey word, unneccessary
                            //console.log("append tables!");
                            //appendTables($scope.html);
                        
                            // on last word -> create definitions table
                            if (index === words.length - 1) {  // last word

                                //console.log(defs);
                                //var defs = getDefinitions($scope.html);
                                //console.log(defs);
                                //console.log(links);

                                if (Object.keys(defs).length) {
                                    // append to end of file
                                    $scope.html += createDefinitionsTable(defs);

                                    // unlock export button!
                                    $scope.olatDownloadEnabled = true;

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
		html += "<div id=\"links-table\" class=\"links-table\"><h4>Links</h4><ul>";
		for (var key in links) {
			var link = links[key];
			var title = link[3];
			var text = link[2];
			var url = link[1];
			if (!title && url !== "definition") {  // skip links with titles (definitions)
				html += "<li><a href='" + url + "' target='_blank'>" + text + "</a></li>\n";
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

	/*function createDefinitionsTable(definitions) {
		var counter = 0; 
        var wordsInTable = [];  // skip duplicates
		var html = "";
		html += "<div id=\"definitions-table\" class=\"definitions-table\"><h4>Definitions</h4><ul>";
		for (var key in links) {
			var link = links[key];
			var tooltip = link[3];
			var word = link[2];
			var url = link[1];

            // skip links without title attribute (tooltip) and
            // definitions already in table 
		var result = "";
		if (counter > 0) {
            result = html;
		}
        return result;
	}*/

    /*function getDefinitions(html) {
        var container = document.createElement("p");
        container.innerHTML = html;

        var anchors = container.getElementsByTagName("a");
        var list = [];
        var titles = []; // avoid duplicates
        for (var i = 0; i < anchors.length; i++) {

            var href = anchors[i].href;
            var title = anchors[i].title;
            var text = anchors[i].textContent;

            if (title && titles.indexOf(title) === -1) {  // only links that have a tooltip aka definitions
                list.push({
                    href: href,
                    title: title,
                    text: text
                });
                titles.push(title);
            }
        }
        return list;
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
            
            if (href.indexOf("http://localhost:3000") === -1 && href.indexOf("#images-table") === -1) {  // ignore in-site links to images-table etc
                list.push(['<a href="' + href + '">' + text + '</a>', href, text, title]);
            }

	        
	    }
        console.log(list);
	    return list;
	}

    /**
     * returns a html div element containing an 
     * unordered list with all images. 
     * requires a list of image objects
     */
    function createImagesTable(images) {
        var html = "";
        if (images.length) {
            html += "<div id=\"images-table\" class=\"images-table\">\n<h4>Abbildungen</h4>\n<ul>";
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

    /**
     * returns a html div element containing an 
     * unordered list with all definitions. 
     * requires a an object of definition objects
     */
    function createDefinitionsTable(definitions) {
        var html = "";

        html += "<div id=\"definitions-table\" class=\"definitions-table\">\n<h4>Glossar</h4>\n<ul>";

        for (var key in definitions) {
            var definition = definitions[key];
            html += "<li>" + 
                    definition.word + ": " +  
                    definition.text + ", " +
                    definition.url +
                    "</li>";
        }

        html += "</ul>\n</div>\n";

        return html;
    }

    /**
     * returns a html div element containing an 
     * unordered list with all level 1 headings. 
     * requires a list of heading objects
     */
    function createTableOfContent(headings) {
        var html = "";
        if (headings.length) {
            html += "<div id=\"headings-table\" class=\"headings-table\">\n<h4>Content</h4>\n<ul>";
            // create html
            headings.forEach(function(heading) {
                if (heading.level === 1) {  // skip all but h1
                    html += "<li><a href=\"#h" + heading.level + "-" + heading.counter + "\">" + 
                        heading.text +  
                        "</a></li>";
                }
            });

        }

        // add images, links and definition references
        // TODO: only add references if they exist
        html += "<li><a href=\"#images-table\">Abbildungen</a></li>\n";
        html += "<li><a href=\"#links-table\">Links</a></li>\n";
        html += "<li><a href=\"#definitions-table\">Glossar</a></li>\n";

        html += "</ul>\n</div>\n";
        return html;
    }

    function createPageTitle(title) {
        return "<h1 class=\"page-title\">" + title + "</h1>";
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


