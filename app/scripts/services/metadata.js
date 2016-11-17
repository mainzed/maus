'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.metadata
 * @description
 * # metadata
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('MetadataService', function () {

    /**
     * extracts metadata from markdown and returns object containing all
     * metadata as well as the cleaned up markdown
    */
    this.getAndReplace = function(markdown) {
        var result = {};

        var cleanMarkdown = markdown;

        // extract metadata from markdown
        var matches;
        matches = cleanMarkdown.match(/^@title:(.*)/);
        if (matches) {
            result.title = matches[1].trim();  // save
            cleanMarkdown = cleanMarkdown.replace(matches[0] + "\n", "");  // remove

        }
        matches = cleanMarkdown.match(/^@author:(.*)/);
        if (matches) {
            result.author = matches[1].trim();
            cleanMarkdown = cleanMarkdown.replace(matches[0] + "\n", "");
        }

        matches = cleanMarkdown.match(/^@created:(.*)/);
        if (matches) {
            result.created = matches[1].trim();
            cleanMarkdown = cleanMarkdown.replace(matches[0] + "\n", "");
        }

        matches = cleanMarkdown.match(/^@updated:(.*)/);
        if (matches) {
            result.updated = matches[1].trim();
            cleanMarkdown = cleanMarkdown.replace(matches[0] + "\n", "");
        }

        matches = cleanMarkdown.match(/^@cover-description:(.*)/);
        if (matches) {
            result.coverDescription = matches[1].trim();
            cleanMarkdown = cleanMarkdown.replace(matches[0] + "\n", "");
        }
        result.markdown = cleanMarkdown;

        return result;
    };
  });
