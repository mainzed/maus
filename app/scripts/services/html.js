'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.HTML
 * @description
 * # HTML
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('HTMLService', function (temporaryService, definitionService) {
    
    /**
     * generates OLAT html from markdown. provides a callback with the generated
     * HTML as parameter
     */
    this.getOlat = function(config, callback) {
        //console.log(callback);
        var config = config || {
            title: true,
            contentTable: true
        };

        // get data
        var markdown = temporaryService.getMarkdown();
        var title = temporaryService.getTitle();


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

            if (!linkUrl.startsWith("#")) {  // skipp local links
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
            var caption = tokens[0].replace(/\\/g, "");
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

        
        var html = marked(markdown, { renderer: customRenderer });


        var stories = getStories(html);  // needed for table of content

        html = replaceStoryTags(html);
        
        
        
        // add tables of images and links
        html += createImagesTable(images);
        html += createLinksTable(links);

        // add table of content to beginning of file
        if (config.contentTable === true) {
            console.log("add table of content!");
            html = createTableOfContent(headings, stories, images) + html;
            //console.log(html);
        }
        
        // add title to beginning of filee
        
        if (config.title === true) {
            html = createPageTitle(title) + html;
        }

        // do last since its async
        replaceDefinitionTags(html, function(html) {
            // everything is replaced
            //console.log(html);
            //html += createDefinitionsTable(defs);
            //$scope.olatDownloadEnabled = true;
            //return html;
            //console.log(html);
            callback(html);
        });
    };

    function replaceDefinitionTags(html, cb) {
        // convert definitions
        // convert definition
        var words = html.match(/\{(.*?)\}/g);
        


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
                            
                            //var html = $scope.html;

                            html = html.replace(word, snippet);
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
                                    html += createDefinitionsTable(defs);
                                    
                                    // call callback function and provide it the newly create html
                                    cb(html);
                                    // unlock export button!
                                    //$scope.olatDownloadEnabled = true;

                                }

                            }
                        }
                    });

                });
            });    
        } else {
            // no definitions in text, unlock download right away
            console.log("no definitions found!");

            cb(html);
            //$scope.olatDownloadEnabled = true;
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
                //console.log("replacing!");
                //console.log()
                html = html.replace(/<p>story{/, '<div class="story" id="story' + counter + '">');
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
                
                if (image.author !== undefined) {
                    html += image.author + "<br>";
                }
                
                if (image.license !== undefined) {
                    html += image.license + "<br>";
                }
                
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
            if (definition.url) {
                html += "<li>" + 
                    "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"" + definition.text + "\">" + definition.word + "</a> (<a href=\"" + definition.url + "\" target=\"_blank\">website</a>)" +
                "</li>";
            } else {
                html += "<li>" + 
                    "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"" + definition.text + "\">" + definition.word + "</a>" +
                "</li>";
            }

        });

        html += "</ul>\n</div>\n";

        return html;
    }

    /**
     * returns a html div element containing an 
     * unordered list with all level 1 headings. 
     * requires a list of heading objects
     */
    function createTableOfContent(headings, stories, images) {
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
                html += "<li class=\"story\"><a href=\"#story" + story.counter + "\">" + story.name + "</a></li>\n";
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

  });



        