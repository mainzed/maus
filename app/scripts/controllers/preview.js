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

        // custom link renderer
        var links = [];
        customRenderer.link = function (linkUrl, noIdea, text) {
            if (linkUrl.indexOf("www.") > -1) {  // skip local links

                links.push({
                    url: linkUrl,
                    text: text
                });
            }
            return "<a href=\"" + linkUrl + "\" target=\"_blank\">" + text + "</a>";
        };

        // custom image renderer
        var images = []; // save images here to use them for the images-table
        var ImageCounter = 1;
        customRenderer.image = function (src, title, alt) {
            // used title attr for caption, author etc
            var tokens = title.split("; ");
            var caption = tokens[0];
            var author = tokens[1];
            var license = tokens[2];
            var url = tokens[3];
            var title = alt;
            var preCaption = "Abb." + ImageCounter;

            // not needed for rendering, but to access them later
            images.push({
                url: url,
                caption: caption,
                author: author,
                license: license,
                title: title,
                preCaption: preCaption
            });
            //var html = "";

            ImageCounter++;

            return '<figure id="' + alt + '">\n' + 
                    "<img src=\"" + src + "\" alt=\"" + alt + "\">" +
                    "<figcaption>\n" + 
                    preCaption + "<br>" + caption + "<br>" + 
                    "<a href=\"#images-table\">\n" + 
                    "(Quelle)\n" +
                    "</a>\n" +
                    "</figcaption>\n" + 
                    "</figure>\n";
        };

		var markdown = temporaryService.getMarkdown();

 		var html = marked(markdown, { renderer: customRenderer });

        createOlatHtml(html);

        //createBootstrapHtml(html); 

    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    
    function createOlatHtml(html) {

        var stories = getStories(html);  // needed for table of content

        html = replaceStoryTags(html);
        
        $scope.html = html;

        replaceDefinitionTags($scope.html);
        
        // add tables of images and links
        $scope.html += createImagesTable(images);
        $scope.html += createLinksTable(links);

        // add table of content to beginning of file
        $scope.html = createTableOfContent(headings, stories) + $scope.html;

        // add title to beginning of filee
        var title = temporaryService.getTitle();

        $scope.html = createPageTitle(title) + $scope.html;

        // append to table of content
        //replaceMaps();
        console.log($scope.html);

        

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
        } else {
            // no definitions in text, unlock download right away
            $scope.olatDownloadEnabled = true;
        }
    }

    /**
     * counts the numer of stories. returns list
     */
    function getStories(html) {

        var stories = [];
        var matches = html.match(/story{/g);
        var counter = 1;
        //console.log(matches);
        if (matches) {
            matches.forEach(function(match) {
                console.log(counter);
                stories.push({
                    counter: counter,
                    name: "Story Teil " + counter
                });
                counter++;
            });
        }

        return stories;
    }

    // replaces opening and closing $ tags with a wrapping div
    // for slides -> use counter to keep track of slide-ids
    function replaceStoryTags(html) {
        //var reg = new RegExp(/§\{([\s\S]*?)\}/, "g");
        //var stories = markdown.match(reg);  // store them for later

        // get count of replacements to add ID
        var matches = html.match(/story{/g);

        // replace one by one to add custom ID for each
        var counter = 1;
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                console.log("replacing!");
                //console.log()
                html = html.replace(/<p>story{/, '<div class="story" id="story-' + counter + '">');
                counter++;
            }
        }
        
        // replace closing tags all at once -> no id needed
        html = html.replace(/}story<\/p>/g, "</div>");
   
        return html;
    } 

    // returns html containing table of links
    // requires array containing link objects
	function createLinksTable(links) {
        var html = "";
		if (links.length) {
    		
            html += "<div id=\"links-table\" class=\"links-table\"><h4>Links</h4><ul>";
    		
            for (var key in links) {
    			var link = links[key];
    			html += "<li><a href='" + link.url + "' target='_blank'>" + link.text + "</a></li>\n";
    		}
    		html += "</ul>\n</div>"; 
        }
        return html;
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
                html += "<li>";
                html += image.preCaption + "<br>"; 
                html += image.title + "<br>";
                html += image.author + "<br>";
                html += "CC " + image.license + "<br>";
                
                if (image.url !== undefined) {
                    html += "<a href=\"" + image.url + "\" target=\"_blank\">Quelle</a>";  
                }

                html += "</li>";
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

        // sort keys by alphabet
        Object.keys(definitions).sort().forEach(function(key) {
            var definition = definitions[key];

            html += "<li>" + 
                    "<a href=\"#\" title=\"" + definition.text + "\" class=\"definition\">" + definition.word + "</a>" +
                    "</li>";

        });

        html += "</ul>\n</div>\n";

        return html;
    }

    /**
     * returns a html div element containing an 
     * unordered list with all level 1 headings. 
     * requires a list of heading objects
     */
    function createTableOfContent(headings, stories) {
        var stories = stories || false;
        var html = "";
        
        html += "<div id=\"headings-table\" class=\"headings-table\">\n<ul>";

        // link to top
        html += "<li><a href=\"#page-title\">Top</a></li>\n";
        html += "<li class=\"seperator\"></li>\n";

        // headings
        if (headings.length) {
            // create html
            headings.forEach(function(heading) {
                if (heading.level === 1) {  // skip all but h1
                    html += "<li><a href=\"#h" + heading.level + "-" + heading.counter + "\">" + 
                        heading.text +  
                        "</a></li>";
                }
            });

        }

        // add stories
        if (stories) {
            html += "<li class=\"seperator\"></li>\n";
            stories.forEach(function(story) {
                html += "<li class=\"story\"><a href=\"#story-" + story.counter + "\">" + story.name + "</a></li>\n";
            });
        }

        // add images, links and definition references
        // TODO: only add references if they exist
        html += "<li class=\"seperator\"></li>\n";
        if (images.length) {
            html += "<li><a href=\"#images-table\">Abbildungen</a></li>\n";
        }
        
        html += "<li><a href=\"#links-table\">Links</a></li>\n";
        html += "<li><a href=\"#definitions-table\">Glossar</a></li>\n";

        html += "</ul>\n</div>\n";
        return html;
    }

    function createPageTitle(title) {
        return "<h1 class=\"page-title\" id=\"page-title\">" + title + "</h1>";
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


