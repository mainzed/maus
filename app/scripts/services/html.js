'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.HTML
 * @description
 * # HTML
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('HTMLService', function (definitionService) {
    
    /**
     * generates OLAT html from markdown. provides a callback with the generated
     * HTML as parameter
     */
     // TODO: dont require file, but create EditorService
    this.getOlat = function(file, definitions, config, callback) {
        //console.log(callback);
        var config = config || {
            addTitle: false,
            addContentTable: false,
            addImagesTable: false,
            addLinksTable: false
        };

        // get data
        var markdown = file.markdown;
        var title = file.title;

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

            return '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>\n';
        };

        // custom link renderer
        var links = [];
        customRenderer.link = function (linkUrl, noIdea, text) {

            // workaround for linkUrl.startsWith
            if (linkUrl.substring(0, 1) !== "#") {  // skip local links
                //console.log("works!");

                links.push({
                    url: linkUrl,
                    text: text.replace("!", "")  // replace ! for "weiterführende links"
                });
            }

            if (text.substring(0, 1) !== "!") {  // ignore "weiterführende links" in text. but they have been pushed to list
                return "<a href=\"" + linkUrl + "\" target=\"_blank\">" + text + "</a>";
            } 
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

        var stories = this.getStories(html);  // needed for table of content

        html = this.replaceStoryTags(html);
        
        // add tables of images and links
        if (config.addImagesTable) {
            html += this.createImagesTable(images);
        }

        if (config.addLinksTable) {
            html += this.createLinksTable(links);
        }

        // add table of content to beginning of file
        // has to be executed after images and links table to be able
        // to add references to them
        if (config.addContentTable === true) {

            //console.log("add table of content!");
            html = this.createTableOfContent(html, headings, stories, images) + html;
            //console.log(html);
        }
        
        // add title to beginning of filee
        if (config.addTitle === true) {
            html =  "<h1 class=\"page-title\" id=\"page-title\">" + title + "</h1>\n" + 
                    html;
        }

        // definitions
        this.replaceDefinitions(html, definitions);
        

        // do last since its async
        /*this.replaceDefinitionTags(html, function(html) {

            // wrap html with header and thml tags
            html = this.wrapHTML(html, title);

            callback(html);
        });*/

        //callback(html);
    };

    this.getMainzedPresentation = function(file) {
        var customRenderer = new marked.Renderer();

        // custom heading renderer
        var headings = [];
        var counter = 0;
        customRenderer.heading = function (text, level) {
            counter++;

            var closeDiv = "";

            if (counter > 1) {
                closeDiv = "</div>";
            }

            return  '<div class="slide" id="slide' + counter + '">\n' +
                    '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>\n';
        };

        var html = marked(file.markdown, { renderer: customRenderer });

        // append last closing div tag
        html += "</div>";

        

        return html;
    };

    this.wrapHTML = function(html, title) {
        
        return "<!DOCTYPE html>\n" + 
                "<html lang=\"de\">" +
                "<head>\n" +
                "<title>" + title + "</title>\n" +
                "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                "<meta property=\"dc:creator\" content=\"Kai Christian Bruhn, Matthias Dufner, Thomas Engel, Axel Kunz\" />\n" + 
                '<link rel="stylesheet" href="style/olat.css">\n' +
                "</head>\n"+
                "<body>\n" +
                html +
                "<script src=\"https://code.jquery.com/jquery-2.2.3.min.js\"></script>\n" +
                "<script src=\"javascript/olat.js\"></script>\n" +
                "</body>\n"+
                "</html>\n";
    };

    this.replaceDefinitionTags = function(html, definitions) {

        // loop through all defined words and look up a definition in the database
        var words = html.match(/\{(.*?)\}/g); 

        if (definitions.length && words) {
            //console.log("word and definition found!");

            words.forEach(function(word, index) {
                // remove brackets
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
                
                var defs = {};
                definitions.forEach(function(definition) {

                    if (definition.word === mainWord) {
                        var snippet;
                        if (extraWord) {  // use extra word as link
                            snippet = "<a href=\"#definitions-table\" title=\"" + definition.text + "\" class=\"definition\">" + extraWord + "</a>";
                        } else {  // use definition mai word as link
                            snippet = "<a href=\"#definitions-table\" title=\"" + definition.text + "\" class=\"definition\">" + definition.word + "</a>";
                        }

                        html = html.replace(word, snippet);

                        if (!defs.hasOwnProperty(definition.word)) {  // skip duplicates
                            defs[definition.word] = definition;
                        }
                        

                        // TODO: gets run again for evey word, unneccessary
                        //console.log("append tables!");
                        //appendTables($scope.html);
                    
                        // on last word -> create definitions table
                        /*if (index === words.length - 1) {  // last word
                            if (Object.keys(defs).length) {
                                cb(html);
                            }
                        }*/
                    }
                });  
            });
        }
        return html;
    };

    /**
     * counts the numer of stories. returns list
     */
    this.getStories = function(html) {

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
    };

    // replaces opening and closing $ tags with a wrapping div
    // for slides -> use counter to keep track of slide-ids
    this.replaceStoryTags = function(html) {
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
                html = html.replace(/<p>story{<\/p>/, '<div class="story" id="story' + counter + '">');
                counter++;
            }
        }
        
        // replace closing tags all at once -> no id needed
        html = html.replace(/<p>}story<\/p>/g, "</div>");
   
        return html;
    }; 

    // returns html containing table of links
    // requires array containing link objects
    this.createLinksTable = function(links) {
        var html = "";
        if (links.length) {
            
            html += "<div id=\"links-table\" class=\"links-table\">\n" +
                    "<h4>Links</h4>\n" + 
                    "<ul>\n";
            
            for (var key in links) {
                var link = links[key];
                html += "<li><a href=\"" + link.url + "\" target=\"_blank\">" + link.text + "</a></li>\n";
            }
            html += "</ul>\n" +
                    "</div>"; 
        }
        return html;
    };

    /**
     * returns a html div element containing an 
     * unordered list with all images. 
     * requires a list of image objects
     */
    this.createImagesTable = function(images) {
        var html = "";
        if (images.length) {
            html += "<div id=\"images-table\" class=\"images-table\">\n<h4>Abbildungen</h4>\n<ul>\n";
            // create html
            images.forEach(function(image) {
                html += "<li>\n";
                html += image.preCaption + "<br>\n"; 
                html += image.title + "<br>\n";
                
                if (image.author !== undefined) {
                    html += image.author + "<br>\n";
                }
                
                if (image.license !== undefined) {
                    html += image.license + "<br>\n";
                }
                
                if (image.url !== undefined) {
                    html += "<a href=\"" + image.url + "\" target=\"_blank\">Quelle</a>\n";  
                }

                html += "</li>\n";
            });
        }
        html += "</ul>\n" + 
                "</div>";
        return html;
    };

    /**
     * returns a html div element containing an 
     * unordered list with all definitions. 
     * requires a an object of definition objects
     */
    this.createDefinitionsTable = function(definitions) {
        var html = "";
        console.log("START!");
        console.log(definitions);
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
        console.log("CREATED TABLE!");

        return html;
    };

    /**
     * returns a html div element containing an 
     * unordered list with all level 1 headings. 
     * requires a list of heading objects
     */
    this.createTableOfContent = function(bodyHtml, headings, stories, images) {
        var stories = stories || false;
        var html = "";
        
        html += "<div id=\"headings-table\" class=\"headings-table\">\n" +
                "<ul>\n";

        // link to top if page title exists
        if (html.match("id=\"page-title\"")) {
            html += "<li><a href=\"#page-title\">Top</a></li>\n";
            html += "<li class=\"seperator\"></li>\n";
        }
        

        // headings
        if (headings.length > 0) {
            // create html
            headings.forEach(function(heading) {
                if (heading.level === 1) {  // skip all but h1
                    html += "<li><a href=\"#h" + heading.level + "-" + heading.counter + "\">" + 
                        heading.text +  
                        "</a></li>\n";
                }
            });
        }

        // add stories
        if (stories.length > 0) {
            html += "<li class=\"seperator\"></li>\n";
            stories.forEach(function(story) {
                html += "<li class=\"story\"><a href=\"#story" + story.counter + "\">" + story.name + "</a></li>\n";
            });
        }

        if (bodyHtml.match("id=\"images-table\"") || bodyHtml.match("id=\"links-table\"") || bodyHtml.match("id=\"links-table\"")) {
            html += "<li class=\"seperator\"></li>\n";
        }

        // add link to images-table if it exists
        if (bodyHtml.match("id=\"images-table\"")) {
            html += "<li><a href=\"#images-table\">Abbildungen</a></li>\n";
        }
        
        // add link to links-table if it exists
        if (bodyHtml.match(/id=\"links-table\"/)) {
            html += "<li><a href=\"#links-table\">Links</a></li>\n";
        }

        // add link to definitions-table if it exists
        if (bodyHtml.match("id=\"definitions-table\"")) { 
            html += "<li><a href=\"#definitions-table\">Glossar</a></li>\n";
        }

        html += "</ul>\n</div>\n";
        return html;
    };

  });



        