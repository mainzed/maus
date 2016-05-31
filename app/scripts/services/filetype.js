'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.filetypeService
 * @description
 * # filetypeService
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('filetypeService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var filetypes = [
        {
            type: "opOlat",
            displayname: "OLAT",
            groups: ["admin", "look-diva", "mainzed"],
            tools: [
                {
                    name: "storytag"
                    // snippet
                },{
                    name: "imagetag"
                },{
                    name: "linktag"
                }
            ],
            assets: {
                definition: {
                    html: "<a href=\"#definitions-table\" title=\"${text}\" class=\"definition\">${word}</a>"
                },
                story: {
                    html: "<div class=\"story\" id=\"story${counter}\">${text}</div>"
                }
                // image
                // linklist
                // story
            }

        },{

            type: "opMainzed",
            displayname: "Mainzed Jahresbericht",
            groups: ["admin", "mainzed", "look-diva"],
            tools: [
                {
                    name: "imagetag"
                },{
                    name: "linktag"
                }
            ],
            assets: {
                definition: {
                    html: "<a href=\"#definitions-table\" title=\"${text}\" class=\"definition\">${word}</a>"
                }
            }
        },{

            type: "prMainzed",
            displayname: "Mainzed Präsentation",
            groups: ["admin", "mainzed", "look-diva"],
            tools: []
        },{

            type: "news",
            displayname: "News",
            groups: ["admin"],
            tools: []
        }
    ];

    this.getAll = function() {
        return filetypes;
    };

    this.getNameByType = function(type) {
        var obj = _.find(filetypes, function(item) {
            return item.type === type;
        });
        if (obj) {
            return obj.displayname;
        } else {
            console.log("unknown filetype: " + type);
        }
    };

    this.isValidToolForType = function(type, toolname) {
        var obj;
        var isValid = false;

        obj = _.find(filetypes, function(item) {
            return item.type === type;
        });

        if (obj) {
            obj.tools.forEach(function(tool) {
                if (tool.name === toolname) {
                    isValid = true;
                }
            });
        }
        return isValid;
    };

    this.isValidTypeForGroup = function(type, group) {
        var obj;
        var isValid = false;

        obj = _.find(filetypes, function(item) {
            return item.type === type;
        });

        if (obj) {
            if (obj.groups.indexOf(group) > -1) {
                isValid = true;
            }
        }
        return isValid;
    };

    this.getTypesByGroup = function(group) {
        var types = [];
        filetypes.forEach(function(filetype) {
            if (filetype.groups.indexOf(group) > -1) {
                types.push(filetype);
            }
        });
        return types;
    };

    /**
     * dynamically fills asset/snippet template and returns generated html string
     */
    var storyCounter = 1;
    this.getAssetByFiletypeAndCategory = function(category, enrichment) {
        var filetype = enrichment.filetype;

        //console.log("looking for: " + category);
        // get correct file object
        var obj = _.find(filetypes, function(item) {
            return item.type === filetype;
        });

        if (!obj.assets) {
            console.log("unknown filetype: " + filetype + " or missing asset definition");
        }

        // look up the string for the specific category
        var template = obj.assets[category].html;

        if (filetype === "opOlat" && category === "definition") {
            // fill template with enrichments
            template = this.populateDefinitions(template, enrichment);

        } else if (filetype === "opMainzed" && category === "definition") {
            template = this.populateDefinitions(template, enrichment);
        }


        //console.log(template);
        return template;
    };

    this.populateDefinitions = function(template, enrichment) {
        template = template.replace("${text}", enrichment.text);
        template = template.replace("${word}", enrichment.word);
        return template;
    };

    this.populateStories = function(template) {
        template = template.replace("${counter}", storyCounter);
        template = template.replace("${text}", enrichment.text);
        storyCounter++;
        return template;
    };

    this.getAssetsForFiletype = function(filetype) {
        var obj = _.find(filetypes, function(item) {
            return item.type === filetype;
        });
        return obj.assets;
    };


  });
