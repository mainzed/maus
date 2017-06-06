'use strict'

var fs = require('fs')
var path = require('path')
var cheerio = require('cheerio')
var marked = require('marked')

var renderer = require('./renderers/jahresbericht')
var Definition = require('./models/definition')

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
        this.recipe = recipe

        // TODO: resolve custom elements
        this.getPageFromTemplate(recipe['template-path']).then((page) => {
          this.getMetadata(this.markdown).then((markdown) => {
            this.markdown = markdown
            this.insertContent(page).then((page) => {
              this.resolveElements(page).then((page) => {
                this.createNavigation(page).then((page) => {
                  // TODO: use metadata
                  // TODO: resolve elements
                  this.page = page
                  resolve(page.html())
                })
              })
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
      // insert main content
      var content = marked(this.markdown, { renderer: renderer })
      page(this.recipe['main-section-selector']).html(content)

      // insert title
      if (this.metadata.title) {
        this.recipe['metadata']['title-selectors'].forEach((selector) => {
          page(selector).text(this.metadata.title)
        })
      }

      // insert cover description
      if (this.metadata.coverDescription) {
        this.recipe['metadata']['cover-description-selectors'].forEach((selector) => {
          page(selector).text(this.metadata.coverDescription)
        })
      }

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

  // records and removes metadata from markdown
  getMetadata (markdown) {
    return new Promise((resolve, reject) => {
      this.metadata = {}
      var cleanMarkdown = markdown
      var matches

      // title
      matches = cleanMarkdown.match(/^@title:(.*)/)
      if (matches) {
        this.metadata.title = matches[1].trim()  // save
        cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '') // remove
      }

      // author
      // matches = cleanMarkdown.match(/^@author:(.*)/)
      // if (matches) {
      //   this.metadata.author = matches[1].trim()
      //   cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
      // }

      // created at
      // matches = cleanMarkdown.match(/^@created:(.*)/)
      // if (matches) {
      //   this.metadata.created = matches[1].trim()
      //   cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
      // }

      // updated at
      // matches = cleanMarkdown.match(/^@updated:(.*)/)
      // if (matches) {
      //   this.metadata.updated = matches[1].trim()
      //   cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
      // }

      // cover description
      matches = cleanMarkdown.match(/^@cover-description:(.*)/)
      if (matches) {
        this.metadata.coverDescription = matches[1].trim()
        cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
      }
      resolve(cleanMarkdown)
    })
  }

  resolveElements (page) {
    return new Promise((resolve, reject) => {
      var promises = []
      var elements = this.getElements(page)

      elements.forEach((element) => {
        console.log("FIRST RUN")
        if (element.category === 'definition') {
          promises.push(this.findDefinitionAndGetReplacement(element))
        }

        Promise.all(promises).then((promises) => {
          // REPLACE ALL OF THEM
          promises.forEach((promise) => {
            var newContent = page(this.recipe['main-section-selector']).html().replace(promise.element.markdown, promise.replacement)
            page(this.recipe['main-section-selector']).html(newContent)
          })
          resolve(page)
        })
      })
    })
  }

  // returns a lit of all elements, their shortcut and type
  getElements (page) {
    var elementList = []
    // find them
    var elements = page(this.recipe['main-section-selector']).html().match(/\{(.*?)\}/g)
    elements.forEach((element) => {
      var content = element.replace('{', '').replace('}', '') // TODO: use regex
      elementList.push({
        markdown: element,
        category: content.split(':')[0].trim(),
        shortcut: content.split(':')[1].trim()
      })
    })
    return elementList
  }

  findDefinitionAndGetReplacement (element) {
    return new Promise((resolve, reject) => {
      // legacy
      var type = this.type
      if (type === 'jahresbericht') {
        type = 'opMainzed'
      }

      Definition.findOne({
        'filetype': type,
        'word': element.shortcut,
        'category': element.category
      }, 'word text', (err, definition) => {
        if (err) reject(err)

        // TODO: use template and insert element specifics
        var tag = `<span id="${definition._id}" class="shortcut">${definition.word}</span>`
        resolve({element: element, replacement: tag})
      })
    })
  }
}

function isValidType (type) {
  return type === 'jahresbericht' || type === 'olat'
}

module.exports = Converter
