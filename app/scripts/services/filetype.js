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
            ]
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
            ]
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

    
  });
