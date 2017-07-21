'use strict'

/**
 * @ngdoc service
 * @name meanMarkdownApp.auth
 * @description
 * # auth
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('ConfigService', function () {
    // production: '' for production
    // development: 'http://localhost:3000/'
    this.HOST = ''

    // convenience variable to get the api route
    this.API_PATH = this.HOST + '/api'
    this.AUTH_PATH = this.HOST + '/auth'

    this.templates = [
      {
        type: 'opOlat',
        name: 'OLAT',
        enrichments: ['definition', 'story']
      },
      {
        type: 'opMainzed',
        name: 'Mainzed Jahresbericht',
        enrichments: ['definition', 'image', 'citation']
      },
      {
        type: 'news',
        name: 'News',
        adminOnly: true
      }
    ]

    this.getTemplateByType = function (type) {
      var template = this.templates.find(function (o) {
        return o.type === type
      })
      return template
    }

    /**
     * Returns true if a template type has the specified enrichment.
     * @param {string} type - template type
     * @param {string} enrichment
     * @returns {boolean}
     */
    this.hasEnrichment = function (type, enrichment) {
      var template = this.getTemplateByType(type)
      if (template && template.enrichments) {
        return template.enrichments.indexOf(enrichment) > -1
      }
    }
  })
