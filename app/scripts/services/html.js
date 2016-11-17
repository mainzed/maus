'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.HTML
 * @description
 * # HTML
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('HTMLService', function (DefinitionService, MetadataService, TemplateService) {

    /**
     * generates OLAT html from markdown. provides a callback with the generated
     * HTML as parameter
     */
     // TODO: dont require file, but create EditorService
    this.getOlat = function(file, definitions, config) {

        config = config || {
            addTitle: false,
            addContentTable: false,
            addDefinitionsTable: false,
            addImagesTable: false
        };

        var html = this.convertOpOlatMarkdownToHTML(file.markdown);

        var page = $("<div>" + html + "</div>");

        this.replaceStoryTags(page);

        this.replaceEnrichmentTags(page, definitions);

        // add tables of images and links
        if (config.addImagesTable) {
            this.createImagesTable(page);
        }

        if (config.addDefinitionsTable) {
            this.createDefinitionsTable(page);
        }

        // add table of content to beginning of file
        // has to be executed after images and links table to be able
        // to add references to them
        if (config.addContentTable) {
            this.createOpOlatNavigation(page);
        }

        // add title to beginning of filee
        if (config.addTitle) {
            $(page).prepend('<h1 class="page-title" id="page-title">' + file.title + '</h1>');
        }

        return $(page).html();
    };

    /**
     * requires all available definitions to be obtained before running.
     * returns generated html.
     */
    this.getOpMainzed = function(file, definitions, template) {

        var metadata = MetadataService.getAndReplace(file.markdown);

        // insert title in head (not possible with jQuery)
        if (metadata.title) {
            var templateTitle = template.match(/<title[^>]*>([^<]*(?:(?!<\/?title)<[^<]*)*)<\/title\s*>/i);
            template = template.replace(templateTitle[0], "<title>" + metadata.title + "</title>");
        }

        // extract body for the use with jQuery to preserve head and html tags
        var templateBody = template.match(/<body[^>]*>([^<]*(?:(?!<\/?body)<[^<]*)*)<\/body\s*>/i)[1];

        // make html string jQuery compatible
        var body = $("<div>" + templateBody + "</div>");

        // insert title
        if (metadata.title) {
            $("h1.titletext", body).text(metadata.title);
        }

        // insert cover description
        if (metadata.coverDescription) {
            $("p.coverdescription", body).text(metadata.coverDescription);
        }

        // insert main content
        var main = this.convertOpMainzedMarkdownToHTML(metadata.markdown);
        $("#read", body).append(main);

        // enrich page: add navigation by listing all headings
        this.createOpMainzedNavigation(body);

        // enrich page: convert tags and add resources to end of document
        this.replaceEnrichmentTags(body, definitions);

        // replace body in template
        template = template.replace(templateBody, body.html());

        return template;
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

    /**
     * uses the marked function to convert markdown to html
     */
    this.convertOpMainzedMarkdownToHTML = function(markdown) {
        var customRenderer = new marked.Renderer();

        var h1Counter = 0;
        var h2Counter = 0;
        var h3Counter = 0;
        customRenderer.heading = function (text, level) {

            if (level === 1) {
                h1Counter++;
                h2Counter = 0;
                h3Counter = 0;

                return '<h1 id="section-' + h1Counter + '" class="hyphenate">' + text + '</h1>\n';
            } else if (level === 2) {
                h2Counter++;
                h3Counter = 0;
                return '<h2 id="section-' + h1Counter + "-" + h2Counter + '" class="hyphenate">' + text + '</h2>\n';

            } else if (level === 3) {
                h3Counter++;
                return '<h3 id="section-' + h1Counter + "-" + h2Counter + "-" + h3Counter + '" class="hyphenate">' + text + '</h3>\n';
            }
        };

        // custom link renderer
        customRenderer.link = function (linkUrl, noIdea, text) {
            if (linkUrl.startsWith("#")) {   // internal link
                return "<a href=\"" + linkUrl + "\" class='internal-link'>" + text + "</a>";
            } else {  // external links
                return "<a href=\"" + linkUrl + "\" class='external-link' target=\"_blank\">" + text + "</a>";
            }

        };
        return marked(markdown, { renderer: customRenderer });
    };

    /**
     * uses the marked function to convert markdown to html
     */
    this.convertOpOlatMarkdownToHTML = function(markdown) {
        var customRenderer = new marked.Renderer();

        // counter that are used in rendering and for custom tags later
        //var storyCounter = 1;

        // custom heading renderer
        //var headings = [];
        var counter = 0;
        customRenderer.heading = function (text, level) {
            counter++;
            return '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>\n';
        };

        // custom link renderer
        //var links = [];
        customRenderer.link = function (linkUrl, noIdea, text) {

            // workaround for linkUrl.startsWith
            //if (linkUrl.substring(0, 1) !== "#" ) {  // skip local links

            //console.log("works!");
            /*links.push({
                url: linkUrl,
                text: text.replace("!", "")  // replace ! for "weiterführende links"
            });*/

            return "<a href=\"" + linkUrl + "\" target=\"_blank\">" + text + "</a>";

        };

        // custom image renderer
        //var images = []; // save images here to use them for the images-table

        var ImageCounter = 1;
        customRenderer.image = function (src, title, alt) {
            // used title attr for caption, author etc
            var tokens = title.split("; ");
            var caption = tokens[0].replace(/\\/g, "");
            var preCaption = "Abb." + ImageCounter;

            ImageCounter++;

            return '<figure id="' + alt + '">\n' +
                    "<img src=\"" + src + "\" alt=\"" + alt + "\" >" +
                    "<figcaption>\n" +
                    preCaption + "<br>" + caption + "<br>" +
                    "<a href=\"#images-table\">\n" +
                    "(Quelle)\n" +
                    "</a>\n" +
                    "</figcaption>\n" +
                    "</figure>\n";
        };
        return marked(markdown, { renderer: customRenderer });
    };

    /**
     * requires html and definitions from the database
     */
    this.replaceEnrichmentTags = function(page, enrichments) {
        var me = this;
        //var enrichment;

        // reset used definitions
        //usedDefs = [];
        var usedEnrichments = [];

        // get all tags
        var tags = $(page).html().match(/\{(.*?)\}/g);

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
                    // legacy support: when no category/keyword is given
                    // it is assumed that it is a definition
                    category = "definition";
                    shortcut = content;
                }

                //var snippet;
                var enrichment;

                if (category === "picturegroup") {
                    me.replacePictureGroup(page, shortcut, enrichments, tag);

                } else if (category === "picture") {
                    enrichment = me.findEnrichmentByShortcut(enrichments, shortcut);
                    if (enrichment) {
                        me.replacePicture(tag, page, enrichment);
                    }

                } else if (category === "citation") {
                    // TODO: configure in filetypes what enrichments are available for
                    // each filetype
                    enrichment = me.findEnrichmentByShortcut(enrichments, shortcut);
                    if (enrichment) {
                        me.replaceCitation(page, enrichment, tag);
                    }

                } else if (category === "definition") {
                    me.replaceDefinition(page, shortcut, tag, enrichments, usedEnrichments);

                } else if (category === "story") {

                    enrichment = me.findEnrichmentByShortcut(enrichments, shortcut);
                    if (enrichment) {
                        me.replaceStory(page, enrichment, tag);
                    }

                }

            });
        }
        return;
    };

    this.replacePictureGroup = function(page, shortcut, enrichments, tag) {
        //console.log(shortcut);
        if (shortcut.length < 2) {
            console.log("Picturegroup needs at least two pictures.");
            throw Error("Picturegroup needs at least two pictures.");
        }
        var me = this;

        // replace tag with picturegroup div
        var previousHTML = $("#read", page).html();
        $("#read", page).html(previousHTML.replace(tag, "<div class='picturegroup'></div>"));

        // append all picutes to the picture group div

        // get all pictures from shortcut
        var shortcuts = shortcut.split(",");
        shortcuts.forEach(function(shortcut) {
            var picture = shortcut.trim();
            var enrichment = me.findEnrichmentByShortcut(enrichments, picture);
            if (!enrichment) {
                console.log("Picture '" + shortcut + "' not found!");
                //throw Error("Picturegroup needs at least two pictures.");
            } else {
                var pictureString = getPictureString(enrichment);
                $(".picturegroup", page).last().append(pictureString);
            }
        });
    };

    this.replacePicture = function(tag, page, enrichment) {
        if (enrichment.filetype !== "opMainzed") {
            console.log("filetype " + enrichment.filetype + "currently does not support picture tags");
            //throw Error("filetype " + enrichment.filetype + "currently does not support picture tags");
        }

        var pictureString = getPictureString(enrichment);

        // replace tag with newly created HTML
        var currentHTML = $("#read", page).html();
        $("#read", page).html(currentHTML.replace(tag, pictureString));

    };

    // private function
    function getPictureString(enrichment) {
        var figureString;
        var authorString = "";
        var licenseString = "";
        var metadataString = "";

        if (enrichment.author) {
            authorString = '<span class="author">Autor: ' + enrichment.author + '</span>';
        }

        if (enrichment.license) {
            licenseString = '<span class="license">Lizenz: ' + enrichment.license + '</span>';
        }

        if (!enrichment.title) {
            console.log("missing image alt attribute");
            enrichment.title = "picture";
        }

        if (authorString || licenseString) {
            metadataString = [
                '<div class="picture-metadata">',
                    authorString,
                    licenseString,
                '</div>'
            ].join("");
        }

        figureString = [
            '<figure id="' + enrichment._id + '">',
                '<img src="' + enrichment.url + '" class="picture" alt="' + enrichment.title + '">',
                '<figcaption>',
                    enrichment.text,
                    metadataString,
                '</figcaption>',
            '</figure>'
        ].join("");

        return figureString;
    }

    this.replaceCitation = function(page, enrichment, tag) {
        if (!enrichment.text || !enrichment.author) {
            console.log("text or author missing for enrichment: " + enrichment.word);
            //throw Error("text or author missing for enrichment: " + enrichment.word);
        }

        var currentHTML = $("#read", page).html();
        if (currentHTML.length < 1) {
            console.log("No div with id #read found in page");
            //throw Error("No div with id #read found in page");
        }

        // TODO: replace with cöass story when opOlat
        /*},
        story: {
            html: "<div class=\"story\" id=\"story${counter}\">${text}</div>",
            title: "Zitate"
        }
        */
        var citationString = '<div class="citation hyphenate">' +
                                marked(enrichment.text) +
                                '<span class="author">' + enrichment.author + '</span>' +
                                '</div>';
        //console.log(currentHTML);
        // replace tag with newly created HTML
        $("#read", page).html(currentHTML.replace(tag, citationString));

        return;
    }

    var storyCounter = 1;
    this.replaceStory = function(page, enrichment, tag) {
        //console.log(enrichment);
        if (enrichment.filetype !== "opOlat") {
            console.log("filetype: " + enrichment.filetype + " does not support the usage of story-tags");
            throw Error("filetype: " + enrichment.filetype + " does not support the usage of story-tags");
        }
        var currentHTML = $(page).html();

        // TODO: replace with cöass story when opOlat
        /*},
        story: {
            html: "<div class=\"story\" id=\"story${counter}\">${text}</div>",
            title: "Zitate"
        }
        */
        var storyString = ['<div class="story">',
                            marked(enrichment.text),
                            '</div>'].join("");
        storyCounter++;
        //console.log(currentHTML);
        // replace tag with newly created HTML
        //TODO: dont replace in every function, just return the string and replace in seperate function
        $(page).html(currentHTML.replace(tag, storyString));

        return;
    }

    this.replaceDefinition = function(page, shortcut, tag, enrichments, usedEnrichments) {
        var currentHTML;
        var snippet;
        var enrichment;
        var customWord;

        // check if custom word provided
        var customWords = shortcut.match(/".*"/);
        //console.log(customWord);
        if (customWords) {
            shortcut = shortcut.replace(customWords[0], "").trim();
            customWord = customWords[0].replace('"', "").replace('"', "");
        }

        // get enrichment
        enrichment = this.findEnrichmentByShortcut(enrichments, shortcut);

        if (enrichment) {
            if (enrichment.filetype === "opOlat") {
                currentHTML = $(page).html();

                snippet =  ["<a href=\"#definitions-table\" title=\"",
                                enrichment.text,
                                "\" class=\"definition\">",
                                customWord || enrichment.word,
                                "</a>"].join("");


                $(page).html(currentHTML.replace(tag, snippet));

            } else if (enrichment.filetype === "opMainzed") {
                currentHTML = $("#read", page).html();
                snippet =  ['<span id="',
                                enrichment._id,
                                '" class="shortcut">',
                                customWord || enrichment.word,
                                '</span>'].join("");

                $("#read", page).html(currentHTML.replace(tag, snippet));
            }

            // for opMainzed, add ressources to end of page
            if (enrichment.filetype === "opMainzed" && usedEnrichments.indexOf(enrichment._id) === -1) {

                var customRenderer = new marked.Renderer();
                customRenderer.link = function (linkUrl, noIdea, text) {
                    if (linkUrl.indexOf("#") === 0) {  // startsWith #
                        return "<a href=\"" + linkUrl + "\" class=\"internal-link\">" + text + "</a>";
                    } else {
                        return "<a href=\"" + linkUrl + "\" class=\"external-link\" target=\"_blank\">" + text + "</a>";
                    }
                };

                var html = marked(enrichment.text, { renderer: customRenderer });

                var metadataString = getDefinitionFootnoteString(enrichment);

                $("#footnotes", page).append([
                    "<div class=\"" + enrichment._id + "\">",
                        "<h4>" + enrichment.word + "</h4>",
                        html,
                        metadataString,
                    "</div>"
                ].join(""));
            }

            if (usedEnrichments.indexOf(enrichment._id) === -1) {  // skip duplicates
                usedEnrichments.push(enrichment._id);
            }
        }
    };

    // private function
    function getDefinitionFootnoteString(enrichment) {

        var authorString = "";
        var websiteString = "";
        var metadataString;

        if (enrichment.author) {
            authorString = '<span class="author">Autor: ' + enrichment.author + '</span>';
        }

        if (enrichment.url) {
            websiteString = [
                '<span class="website">',
                    '<a href="' + enrichment.url + '" target="_blank">Website</a>',
                '</span>'
            ].join("");
        }

        if (authorString || websiteString) {
            metadataString = [
                '<div class="definition-metadata">',
                    authorString,
                    websiteString,
                '</div>'
            ].join("");
        }

        return metadataString;
    }

    /**
     * wrapper to support the old function name
     */
    this.replaceDefinitionTags = function(page, enrichments) {
        return this.replaceEnrichmentTags(page, enrichments);
    };

    /**
     * helper function that loops through all enrichments and finds match
     */
     // TODO: access enrichments directly via DefinitionService
    this.findEnrichmentByShortcut = function(enrichments, shortcut) {
        var result;
        enrichments.forEach(function(enrichment) {
            if (enrichment.word === shortcut) {
                result = enrichment;
            }
        });
        return result;
    };

    // replaces opening and closing $ tags with a wrapping div
    // for slides -> use counter to keep track of slide-ids
    this.replaceStoryTags = function(page) {

        var html = $(page).html();

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

        $(page).html(html);
        return;
    };

    /**
     * returns a html div element containing an
     * unordered list with all images.
     * requires a list of image objects
     */
    this.createImagesTable = function(page) {

        var figures = $("figure", page);

        if (figures.length > 0) {
            // append table of images to end of page
            $(page).append('<div id="images-table" class="images-table"><h4>Abbildungen</h4><ul></ul></div>');

            // append images
            figures.each(function(index) {
                // get metadata from title
                var caption = $(this).find("figcaption").text();
                //console.log(caption);

                //$('div.post br').after('<br/>');

                //var metadata
                /*var metadata = $(this).attr('title').split(";");
                var caption = metadata[0];
                var author = metadata[1];
                var license = metadata[2];
                var url = metadata[3];
                */

                //var imageString = '<li>Abb.' + (index + 1) + "<br>" + caption + '<br>' + author + '<br>' + license + '<br><a href="' + url + '" target="_blank">Quelle</a></li>';

                var imageString = '<li>Abb.' + (index + 1) + "<br>" + caption + "</li>";

                $("#images-table ul", page).append(imageString);
            });
        }
        return;
    };

    /**
     * returns a html div element containing an
     * unordered list with all definitions.
     * requires a an object of definition objects
     */
    this.createDefinitionsTable = function(page) {

        var definitions = $("a.definition", page);

        // append table if definitions
        if (definitions.length > 0) {
            $(page).append("<div id=\"definitions-table\" class=\"definitions-table\">\n" +
                    "<h4>Glossar</h4>\n" +
                    "<ul></ul>\n" +
                    "</div>");

            // append definitions
            var usedDefs = [];
            definitions.each(function() {
                if (usedDefs.indexOf($(this).html()) === -1) {  // skip duplicates
                    var defString = '<li><a href="#" target="_blank" class="definition" title="' + $(this).attr("title") + '">' + $(this).html() + '</a></li>';
                    $("#definitions-table ul", page).append(defString);
                    usedDefs.push($(this).html());
                }
            });
        }
        return;
    };

    /**
     * requires pages (jquery selection from htmlString)
     */
    this.createOpMainzedNavigation = function(page) {
        var previousHeadingLevel;
        $("h1, h2", page).each(function(index) {
            if (index > 0) {  // skip jahresbericht title

                // generate string
                var headingString = "<a href=\"#" + $(this).attr('id') + "\">" + $(this).text() + "</a>";

                // append string based on level
                if ($(this).is("h1")) {

                    $("#nav", page).append("<li>" + headingString + "</li>");
                    previousHeadingLevel = 1;

                } else if ($(this).is("h2")) {  // h2

                    if (previousHeadingLevel === 1) {
                        // if previous was 1, open new ul and append li
                        $("#nav li", page).last().append("<ul><li>" + headingString + "</li></ul>");

                    } else if (previousHeadingLevel === 2) {
                        //  if previous was 2, just append to ul
                        $("#nav ul", page).last().append("<li>" + headingString + "</li>");
                    }
                    previousHeadingLevel = 2;
                }
            }
        });

        // prepend link to cover
        $("ul#nav", page).prepend('<li><a href="#titlepicture">Cover</a></li>');

        // append link to imprint
        $("ul#nav", page).append('<li><a href="#imprint">Impressum</a></li>');

        return;
    };

    /**
     * requires pages (jquery selection from htmlString)
     */
    this.createOpOlatNavigation = function(page) {

        var headers = $("h1", page);
        var stories = $(".story", page);
        var images = $("#images-table", page);
        var definitions = $("#definitions-table", page);

        // append table of content div to top of page
        $(page).prepend('<div id="headings-table" class="headings-table"><ul></ul></div>');

        // append link to page-title it it exists
        if ($("#page-title", page).length > 0) {
            $("#headings-table ul", page).append("<li><a href=\"#page-title\">Top</a></li>");

            // add seperator
            $("#headings-table ul", page).append('<li class="seperator"></li>');
        }

        // append links to headings
        headers.each(function() {
            var headingsString = '<li><a href="#' + $(this).attr('id') + '">' + $(this).text() + '</a></li>';
            $("#headings-table ul", page).append(headingsString);
        });

        // add seperator if stories exist
        if (stories.length > 0) {
            $("#headings-table ul", page).append('<li class="seperator"></li>');
        }

        // append links to stories
        stories.each(function(index) {
            var storyString = '<li class="story"><a href="#' + $(this).attr('id') + '">Story Teil ' + (index + 1) + '</a></li>';
            $("#headings-table ul", page).append(storyString);
        });

        // add seperator if images, links or definitions table exist
        if (images.length > 0 || definitions.length > 0) {
            $("#headings-table ul", page).append('<li class="seperator"></li>');
        }

        // add link to images table if it exists
        if (images.length > 0) {
            $("#headings-table ul", page).append("<li><a href=\"#images-table\">Abbildungen</a></li>");
        }

        // add link to definitions-table if it exists
        if (definitions.length > 0) {
            $("#headings-table ul", page).append("<li><a href=\"#definitions-table\">Glossar</a></li>");
        }

        return;
    };

  });
