'use strict'

var fs = require('fs')
var path = require('path')
var cheerio = require('cheerio')
var marked = require('marked')

var renderer = require('./renderers/jahresbericht')

var RECIPES_PATH = 'recipes.json'

// Converts markdown to valid HTML as specified by a config file
class Converter {
  constructor (type, markdown) {
    if (!isValidType(type)) {
      console.log('unknown file type: ' + type)
    }
    this.type = type
    this.markdown = markdown
  }

  convert () {
    return new Promise((resolve, reject) => {
      this.getRecipe(this.type).then((recipe) => {

        // TODO: resolve custom elements
        this.getPageFromTemplate(recipe['template-path']).then((page) => {
          this.insertContent(page).then((page) => {
            this.createNavigation(page).then((page) => {
              // TODO: use metadata
              // TODO: resolve elements
              this.page = page
              resolve(page.html())
            })
          })
        })
      })
      .catch((err) => reject(err))
    })
  }

  // promise that returns the recipe
  getRecipe (type) {
    return new Promise(function (resolve, reject) {
      var filePath = path.resolve(__dirname, RECIPES_PATH)
      fs.readFile(filePath, 'utf8', function (err, jsonData) {
        if (err) reject(err)
        var data = JSON.parse(jsonData)
        resolve(data[type])
      })
    })
  }

  // returns a cheerio page object from template
  getPageFromTemplate (templatePath) {
    return new Promise((resolve, reject) => {
      var filePath = path.resolve(__dirname, templatePath)
      fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) reject(err)
        var page = cheerio.load(data)
        resolve(page)
      })
    })
  }

  // TODO: getMetadata - and remove

  // converts markdown to HTML and inserts it into the template's main section
  insertContent (page) {
    return new Promise((resolve, reject) => {
      var content = marked(this.markdown, { renderer: renderer })
      page('#read').html(content)
      resolve(page)
    })
  }

  // returns the path of the preview file
  createPreview (userID) {
    return new Promise((resolve, reject) => {
      // copy stuff into preview folder
      var filename = '/preview_' + userID + '.html'
      var outputPath = path.join(__dirname, 'preview', this.type.toLowerCase(), filename)
      fs.writeFile(outputPath, this.page.html(), (err) => {
        if (err) reject(err)
        // success
        resolve(filename)
      })
    })
  }

  createNavigation (page) {
    var $ = page
    return new Promise((resolve, reject) => {
      var previousHeadingLevel

      $('h1, h2').each((index, value) => {
        if (index > 0) {  // skip jahresbericht title
          // generate string
          var id = $(value).attr('id')
          var text = $(value).text()
          var link = `<a href="#${id}">${text}</a>`

          // append string based on level
          if ($(value).is('h1')) {
            $('#nav').append(`<li>${link}</li>`)
            previousHeadingLevel = 1
          } else if ($(value).is('h2')) {
            if (previousHeadingLevel === 1) {
              // if previous was 1, open new ul and append li
              $('#nav li').last().append(`<ul><li>${link}</li></ul>`)
            } else if (previousHeadingLevel === 2) {
              //  if previous was 2, just append to ul
              $('#nav ul').last().append(`<li>${link}</li>`)
            }
            previousHeadingLevel = 2
          }
        }
      })

      // prepend link to cover
      $('ul#nav').prepend('<li><a href="#titlepicture">Cover</a></li>');
      // append link to imprint
      $('ul#nav').append('<li><a href="#imprint">Impressum</a></li>');

      resolve($)
    })
  }
}

function isValidType (type) {
  return type === 'jahresbericht' || type === 'olat'
}

module.exports = Converter
