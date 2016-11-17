"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.auth
 * @description
 * # auth
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
.service("ConfigService", function() {

    // host adress -> set to "" for production, "http://localhost:3000/" for development
    this.HOST = "http://localhost:3000";

    // convenience variable to get the api route
    this.API_PATH = this.HOST + "/api";

    this.templates = [
        {
            type: "opOlat",
            name: "OLAT",
            enrichments: ["definition", "story"]
        },
        {
            type: "opMainzed",
            name: "Mainzed Jahresbericht",
            enrichments: ["definition", "image", "citation"]
        },
        {
            type: "prMainzed",
            name: "Mainzed Präsentation"
        },
        {
            type: "news",
            name: "News",
            adminOnly: true
        }
    ];

    this.getTemplateByType = function(type) {
        var template = this.templates.find(function(o) {
            return o.type === type;
        });
        return template;
    };

    /**
     * Returns true if a template type has the specified enrichment.
     * @param {string} type - template type
     * @param {string} enrichment
     * @returns {boolean}
     */
    this.hasEnrichment = function(type, enrichment) {
        var template = this.getTemplateByType(type);
        if (template && template.enrichments) {
            return template.enrichments.indexOf(enrichment) > -1;
        }
    };

});
