'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.HTML
 * @description
 * # HTML
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('HTMLService', function (definitionService, filetypeService) {

    var usedDefs;  // store IDs of actually used defs
    /**
     * generates OLAT html from markdown. provides a callback with the generated
     * HTML as parameter
     */
     // TODO: dont require file, but create EditorService
    this.getOlat = function(file, definitions, config) {
        //console.log(callback);
        config = config || {
            addTitle: false,
            addContentTable: false,
            addImagesTable: false
            //addLinksTable: false
        };

        // get data
        var markdown = file.markdown;

        var title = file.title;

        // convert markdown
        var customRenderer = new marked.Renderer();

        // counter that are used in rendering and for custom tags later
        var storyCounter = 1;

        // custom heading renderer
        var headings = [];
        var counter = 0;
        customRenderer.heading = function (text, level) {
            counter++;
            //var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

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
            //if (linkUrl.substring(0, 1) !== "#" ) {  // skip local links

            //console.log("works!");
            links.push({
                url: linkUrl,
                text: text.replace("!", "")  // replace ! for "weiterführende links"
            });

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

        var stories = this.getStories(html);  // needed for table of content

        html = this.replaceStoryTags(html, storyCounter);

        //var usedDefs = [];
        html = this.replaceEnrichmentTags(html, definitions, storyCounter);

        // add tables of images and links
        if (config.addImagesTable) {
            html += this.createImagesTable(images);
        }

        /*if (config.addLinksTable) {
            html += this.createLinksTable(links);
        }*/

        if (config.addDefinitionsTable && usedDefs.length > 0) {
            html += this.createDefinitionsTable(definitions);
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

        return html;
    };

    this.getPrMainzed = function(file) {
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

        //console.log(html);

        //html = wrapPrMainzedHTML(html, file.title);

        return html;
    };

    /**
     * requires all available definitions to be obtained before running.
     * returns generated html.
     */
    this.getOpMainzed = function(file, definitions) {

        // convert markdown
        var customRenderer = new marked.Renderer();

        var headings = [];
        var h1Counter = 0;
        var h2Counter = 0;
        var h3Counter = 0;
        customRenderer.heading = function (text, level) {

            if (level === 1) {
                h1Counter++;
                h2Counter = 0;
                h3Counter = 0;

                headings.push({
                    text: text,
                    level: level,
                    counter: h1Counter,
                    idString: "section-" + h1Counter
                });

                return '<h1 id="section-' + h1Counter + '">' + text + '</h1>\n';
            } else if (level === 2) {
                h2Counter++;
                h3Counter = 0;

                headings.push({
                    text: text,
                    level: level,
                    counter: h2Counter,
                    idString: "section-" + h1Counter + "-" + h2Counter
                });

                return '<h2 id="section-' + h1Counter + "-" + h2Counter + '"">' + text + '</h2>\n';
            } else if (level === 3) {
                h3Counter++;

                headings.push({
                    text: text,
                    level: level,
                    counter: h3Counter,
                    idString: "section-" + h1Counter + "-" + h2Counter + "-" + h3Counter
                });

                return '<h3 id="section-' + h1Counter + "-" + h2Counter + "-" + h3Counter + '"">' + text + '</h3>\n';
            }
        };

        // custom link renderer
        customRenderer.link = function (linkUrl, noIdea, text) {
            return "<a href=\"" + linkUrl + "\" target=\"_blank\">" + text + "</a>";
        };

        // custom image renderer
        /*var images = []; // save images here to use them for the images-table
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
        };*/

        // create template
        var htmlString = '<div id="ressourceswrapper">' +
        		        '<div id="ressources">' +
        			        '<span id="navicon">' +
        			            '<span class="icon-toc"></span>' +
        			        '</span>' +

                			'<span id="closeicon">' +
                				'<span class="icon-close"></span>' +
                			'</span>' +

                			'<div id="titletextbg">' +
                				'<h1 class="titletext title">mainzed jahresbericht <br>1</h1>' +
                				'<a class="start titletext" href="#read">Jetzt lesen</a>' +
                			'</div>' +

                            // navigation
                            "<ul id=\"nav\"></ul>\n" +

                            // glossar texts get appended here
        			        '<div id="ressourcestext"></div>' +

        		        '</div>' +
        	        '</div>' +

                    // markdown content goes here
                    '<div id="read"></div>\n' +

                    // glossar resources go here and will be activated via js
                    "<div id='footnotes'></div>\n";

        // make jQuery compatible
        var page = $("<div>" + htmlString + "</div>");

        // enrich page

        // add markdown content
        var html = marked(file.markdown, { renderer: customRenderer });
        $("#read", page).append(html);

        // add headings to navigation
        this.createOpMainzedNavigation(page, headings);

        // convert tags and add resources to end of document
        this.replaceEnrichmentTags(page, definitions);

        // get html from page via jquery
        return page.html();
    };

    this.wrapOlatHTML = function(html, title, isFolder) {
        var stylePath;

        if (isFolder) {
            stylePath = "../style/olat.css";
        } else {
            stylePath = "style/olat.css";
        }

        return "<!DOCTYPE html>\n" +
                "<html lang=\"de\">\n" +
                "<head>\n" +
                "<title>" + title + "</title>\n" +
                "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                "<meta property=\"dc:creator\" content=\"Kai Christian Bruhn, Matthias Dufner, Thomas Engel, Axel Kunz\" />\n" +
                '<link rel="stylesheet" href="' + stylePath + '">\n' +
                "</head>\n"+
                "<body>\n" +
                html + "\n" +
                "<script src=\"https://code.jquery.com/jquery-2.2.3.min.js\"></script>\n" +
                "<script src=\"javascript/app.js\"></script>\n" +
                "</body>\n"+
                "</html>";
    };

    this.wrapPrMainzedHTML = function(html, title) {

        return "<!DOCTYPE html>\n" +
                "<html lang=\"de\">\n" +
                "<head>\n" +
                "<title>" + title + "</title>\n" +
                "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                "<meta property=\"dc:creator\" content=\"Kai Christian Bruhn, Matthias Dufner, Thomas Engel, Axel Kunz\" />\n" +
                '<link rel="stylesheet" href="style/prmainzed.css">\n' +
                "</head>\n"+
                "<body>\n" +
                html + "\n" +
                "<script src=\"https://code.jquery.com/jquery-2.2.3.min.js\"></script>\n" +
                "<script src=\"javascript/app.js\"></script>\n" +
                "</body>\n"+
                "</html>";
    };

    this.wrapOpMainzedHTML = function(html, title) {

        return "<!DOCTYPE html>\n" +
                "<html lang=\"de\">\n" +
                "<head>\n" +
                '<meta charset="UTF-8">' +
                "<title>" + title + "</title>\n" +

                '<link rel="stylesheet" href="style/reader.css">\n' +
                '<link rel="stylesheet" href="style/style.css">\n' +
                '<META NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">' +
                "</head>\n"+
                "<body>\n" +

                '<div id="titlepicture">' +
            		'<p class="coverdescription titletext">Skizze des mainzed</p>' +
            	'</div>' +
            	'<div id="scrollmarker"></div>' +


                html +

                    '<div id="imprint">' +
                		'<h3>Impressum</h3>' +
                		'<p>Angaben gemäß § 5 TMG:</p>' +


                		'<div class="address" about="#mainzed" typeof="foaf:Organization">' +
                			'<span class="organisationnameimprint" property="foaf:name">' +
                				'mainzed - Mainzer Zentrum für Digitalit&auml;t in den Geistes- und Kulturwissenschaften			</span><br>' +
                			'<div rel="vcard:hasAddress">' +
                				'<address>' +
                				'c/o Hochschule Mainz University of Applied Sciences<br>' +
                				'<div property="vcard:street-address">Lucy-Hillebrandtstr.2</div>' +
                				'<span property="vcard:postal-code">55128</span> <span property="vcard:locality">Mainz</span>, <span property="vcard:country-name">Germany</span>' +
                				'</address>' +
                			'</div>' +
                		'</div>' +
                	'</div>' +



                '<script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>' +

                '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.nanoscroller/0.8.7/javascripts/jquery.nanoscroller.js"></script>' +
                '<script src="https://cdnjs.cloudflare.com/ajax/libs/waypoints/4.0.0/jquery.waypoints.min.js"></script>' +

                '<script src="javascript/app.js"></script>' +
                '<script src="javascript/markactive.js"></script>' +

                "</body>\n"+
                "</html>";
    };

    /**
     * requires html and definitions from the database
     */
    this.replaceEnrichmentTags = function(page, enrichments, storyCounter) {
        var me = this;
        //var enrichment;

        // reset used definitions
        usedDefs = [];
        var usedEnrichments = [];

        // get all tags
        var tags = $("#read", page).html().match(/\{(.*?)\}/g);

        // loop through all tags
        if (tags) {
            tags.forEach(function(tag) {
                // bracket content
                var content = tag.replace("{", "").replace("}", "");

                // extract category keyword and shortcut
                var category;
                var shortcut;

                if (content.split(":").length > 1) {
                    category = content.split(":")[0].trim();
                    shortcut = content.split(":")[1].trim();
                } else {
                    // legacy support
                    category = "definition";
                    shortcut = content;
                    //console.log("shortcut: " + shortcut);
                }

                //console.log(category);
                //console.log(shortcut);

                // get enrichment for the specified shortcut
                var enrichment = me.findEnrichmentByShortcut(enrichments, shortcut);
                //console.log(enrichment);

                // get multiple enrichments for pictuee group
                if (category === "picturegroup") {
                    me.replacePictureGroups(page, shortcut, enrichments, tag);
                }

                // get snippet based on category and filetype
                // templates for this are defined in filetypeService
                if (enrichment && category !== "picturegroup") {
                    var snippet = filetypeService.getAssetByFiletypeAndCategory(category, enrichment);

                    if (snippet || category === "picture") {
                        // actually replace the tag
                        var currentHTML = $("#read", page).html();

                        if (category === "picture") {
                            //console.log(enrichment);
                            snippet = '<figure>\n' +
                                            '<img src="' + enrichment.url + '" class="picture" alt="">\n' +
                                            '<figcaption>\n' +
                                                enrichment.text +
                                            '</figcaption>\n' +
                                        '</figure>';


                            //$("#footnotes", page).append("<div class=\"" + enrichment._id + "\">" + marked(enrichment.text) + "</div>\n");


                            // replace tag with newly created HTML
                            $("#read", page).html(currentHTML.replace(tag, snippet));
                        } else if (category === "picturegroup") {
                            // get all picture shortcuts from shortcut
                            console.log(shortcut);

                        } else {
                            // definition and everything else
                            $("#read", page).html(currentHTML.replace(tag, snippet));


                            //console.log(footnoteContent);
                            if (category === "definition" && enrichment.filetype === "opMainzed" && usedEnrichments.indexOf(enrichment.word)) {

                                // make html usable with jquery
                                //var page = $("<div>" + html + "</div>");

                                // select footnotes div and append resources
                                $("#footnotes", page).append("<div class=\"" + enrichment._id + "\">" + marked(enrichment.text) + "</div>\n");

                                //html = page.html();

                                usedEnrichments.push(enrichment.word);
                            }
                        }


                        // record all enrichments for content tables
                        if (usedDefs.indexOf(enrichment._id) === -1) {  // skip duplicates
                            usedDefs.push(enrichment._id);
                        }
                    } else {
                        console.log("unknown enrichment filetype: " + enrichment.filetype + " or category: " + category);
                    }
                }

            })
        }
        return;
    };

    this.replacePictureGroups = function(page, shortcut, enrichments, tag) {
        //console.log(shortcut);
        if (shortcut.length < 2) {
            console.log("Picturegroup needs at least two pictures.");
        }
        console.log("placing picturegroup");

        var me = this;

        // replace tag with picturegroup div
        var previousHTML = $("#read", page).html();
        $("#read", page).html(previousHTML.replace(tag, "<div class='picturegroup'></div>"));

        // append all picutes to the picture group div

        // get all pictures from shortcut
        var shortcuts = shortcut.split(",");
        //var enrichmentList = [];
        shortcuts.forEach(function(shortcut) {
            var picture = shortcut.trim();
            //enrichmentList.push(me.findEnrichmentByShortcut(enrichments, picture));
            var enrichment = me.findEnrichmentByShortcut(enrichments, picture);
            console.log("picture group: ");
            console.log(enrichment);
            var figureString = '<figure>\n' +
                            '<img src="' + enrichment.url + '" class="picture" alt="">\n' +
                            '<figcaption>\n' +
                                enrichment.text +
                            '</figcaption>\n' +
                        '</figure>';

            $(".picturegroup", page).last().append(figureString);
        });










        console.log($(".picturegroup", page).html());

        // append all pictures to last picturegroup

        /*var currentHTML = $("#read", page).html();


            snippet = '<div class="pictureWrapper">\n' +
                        '<figure>\n' +
                            '<img src="' + enrichment.text + '" class="picture" alt="">\n' +
                            '<figcaption>\n' +
                                enrichment.text +
                            '</figcaption>\n' +
                        '</figure>\n' +
                      '</div>';
        */

            //$("#footnotes", page).append("<div class=\"" + enrichment._id + "\">" + marked(enrichment.text) + "</div>\n");


            // replace tag with newly created HTML


        //$("#read", page).html();

        //console.log(enrichmentList);
    };

    /**
     * wrapper to support the old function name
     */
    this.replaceDefinitionTags = function(html, enrichments) {
        return this.replaceEnrichmentTags(html, enrichments);
    };

    /**
     * helper function that loops through all enrichments and finds match
     */
     // TODO: access enrichments directly via definitionService
    this.findEnrichmentByShortcut = function(enrichments, shortcut) {
        var result;
        enrichments.forEach(function(enrichment) {
            if (enrichment.word === shortcut) {
                result = enrichment;
            }
        });
        return result;
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
        html += "<div id=\"definitions-table\" class=\"definitions-table\">\n" +
                "<h4>Glossar</h4>\n" +
                "<ul>\n";

        // sort keys by alphabet
        Object.keys(definitions).sort().forEach(function(key) {
            var definition = definitions[key];
            //console.log(definition.word);

            if (usedDefs.indexOf(definition._id) > -1 && definition.word) {  // definition was used in text and has a word

                html += "<li>\n";
                if (definition.url) {
                    html += "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"" + definition.text + "\">" + definition.word + "</a> (<a href=\"" + definition.url + "\" target=\"_blank\">website</a>)\n";
                } else {
                    html += "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"" + definition.text + "\">" + definition.word + "</a>\n";
                }
                html += "</li>\n";
            }
        });

        html += "</ul>\n</div>\n";
        //console.log(html);
        return html;
    };

    /**
     * returns a html div element containing an
     * unordered list with all level 1 headings.
     * requires a list of heading objects
     */
    this.createTableOfContent = function(bodyHtml, headings, stories, images) {
        stories = stories || false;
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

        // add seperator if images, links or definitions table exist
        if (bodyHtml.match("id=\"images-table\"") || bodyHtml.match("id=\"links-table\"") || bodyHtml.match("id=\"definitions-table\"")) {
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

    /**
     * requires pages (jquery selection from htmlString)
     */
    this.createOpMainzedNavigation = function(page, headings) {

        var previousHeadingLevel;
        if (headings.length > 0) {
            // create html
            headings.forEach(function(heading) {

                var headingString = "<a href=\"#" + heading.idString + "\">" +
                    heading.text + "</a>";

                if (heading.level === 1) {  // skip all but h1
                    $("#nav", page).append("<li>" + headingString + "</li>");

                    // 1Up
                    previousHeadingLevel = heading.level;

                } else if (heading.level === 2) {

                    // if previous was 1, open new ul and append li
                    if (previousHeadingLevel === 1) {
                        $("#nav li", page).last().append("<ul><li>" + headingString + "</li></ul>");

                       //  if previous was 2, just append to ul
                    } else if (previousHeadingLevel === 2) {
                        $("#nav ul", page).last().append("<li>" + headingString + "</li>");
                    }

                    // 1Up
                    previousHeadingLevel = heading.level;
                }
            });
        }
        return;
    };

  });
