"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.PreviewService
 * @description
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
  .service("PreviewService", function ($http, ConfigService) {

    /**
     * Resolves with preview path.
     */
    this.save = function(postData) {
        return new Promise(function(resolve, reject) {
            $http.post(ConfigService.API_PATH + "/preview", postData).then(function(res) {
                resolve(ConfigService.HOST + "/" +  res.data.previewPath);
            }, function error(res) {
                reject(res);
            });
        });
    };
});
