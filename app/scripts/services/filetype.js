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
            tools: []
        },{
            type: "news",
            displayname: "News",
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

    this.isValidToolForType = function(type) {
        var obj = _.find(filetypes, function(item) { 
            return item.type === type; 
        });
    }

  });
