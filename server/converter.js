'use strict'

var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var cheerio = require('cheerio')
var marked = require('marked')
var archiver = require('archiver')

var renderer = require('./renderers/jahresbericht')
var Definition = require('./models/definition')
var File = require('./models/file')

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
            this.resolveIncludes(markdown).then((markdown) => {
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

  resolveIncludes (markdown) {
    return new Promise((resolve, reject) => {
      var promises = []
      var includes = this.getIncludes(markdown)

      includes.forEach((include) => {
        promises.push(this.findIncludeAndGetReplacement(include))
      })

      Promise.all(promises).then((promises) => {
        promises.forEach((promise) => {
          markdown = markdown.replace(promise.include.original, promise.replacement)
        })
        resolve(markdown)
      })
    })
  }

  getIncludes (markdown) {
    var includesList = []
    // find them
    var includes = markdown.match(/include\((.*?)\)/g)
    if (includes) {
      includes.forEach((include) => {
        var fileName = include.replace('include(', '').replace(')', '')
        includesList.push({
          original: include,
          fileName: fileName
        })
      })
    }
    return includesList
  }

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

      // insert link to pdf
      if (this.metadata.pdfPath) {
        this.recipe['metadata']['pdf-link-selectors'].forEach((selector) => {
          page(selector).attr('href', this.metadata.pdfPath)
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

  createBundle (userID) {
    return new Promise((resolve, reject) => {
      // input
      var resourcePath = path.join(__dirname, 'preview/jahresbericht')
      var inCss = path.join(resourcePath, 'style')
      var inJs = path.join(resourcePath, 'js')

      // output
      var destPath = path.join(__dirname, 'tmp', userID)
      var outIndex = path.join(destPath, 'index.html')
      var outCss = path.join(destPath, 'style')
      var outJs = path.join(destPath, 'js')

      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath)
      }

      var promises = []
      promises.push(writeFile(outIndex, this.page.html()))
      promises.push(copyFolder(inCss, outCss))
      promises.push(copyFolder(inJs, outJs))

      // when all files are written and copied, compress them into zip archive
      Promise.all(promises).then(values => {
        zipFolder(destPath, destPath + '.zip')
        resolve(destPath + '.zip')
      })
      .catch(err => reject(err))
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

      // link to pdf version of the current file
      matches = cleanMarkdown.match(/^@pdf:(.*)/)
      if (matches) {
        this.metadata.pdfPath = matches[1].trim()
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
        if (element.category === 'definition') {
          promises.push(this.findDefinitionAndGetReplacement(element))
        } else if (element.category === 'citation') {
          promises.push(this.findCitationAndGetReplacement(element))
        } else if (element.category === 'story') {
          promises.push(this.findStoryAndGetReplacement(element))
        }
      })

      // actually replace them
      Promise.all(promises).then((promises) => {
        console.log(promises.length)
        promises.forEach((promise) => {
          console.log(promise.element.markdown)
          var newContent = page(this.recipe['main-section-selector']).html().replace(promise.element.markdown, promise.replacement)
          page(this.recipe['main-section-selector']).html(newContent)
        })
        resolve(page)
      })
    })
  }

  // returns a lit of all elements, their shortcut and type
  getElements (page) {
    var elementList = []
    // find them
    var elements = page(this.recipe['main-section-selector']).html().match(/\{(.*?)\}/g)
    if (elements) {
      elements.forEach((element) => {
        var content = element.replace('{', '').replace('}', '') // TODO: use regex
        elementList.push({
          markdown: element,
          category: content.split(':')[0].trim(),
          shortcut: content.split(':')[1].trim()
        })
      })
    }
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
      }, 'word text author url', (err, definition) => {
        if (err) reject(err)

        // TODO: use template and insert element specifics
        var tag = `<span id="${definition._id}" class="shortcut">
                    ${definition.word}
                    <span class="definition">
                      <span class="definition-title">${definition.text}</span>
                      <span class="definition-text">${definition.word}</span>
                      <span class="definition-author">${definition.author}</span>
                      <span class="definition-website">${definition.url}</span>
                    </span>
                  </span>`

        /*
                  <span class="metadata">
                        <span class="author">Autor: ${definition.author}</span>
                        <span class="website"><a href="${definition.url}" target="_blank">Website</a></span>
                      </span>
                      */
        // TODO: convert to markdown
        // var customRenderer = new marked.Renderer();
        //     customRenderer.link = function (linkUrl, noIdea, text) {
        //       if (linkUrl.indexOf("#") === 0) {  // startsWith #
        //         return "<a href=\"" + linkUrl + "\" class=\"internal-link\">" + text + "</a>";
        //       } else {
        //         return "<a href=\"" + linkUrl + "\" class=\"external-link\" target=\"_blank\">" + text + "</a>";
        //       }
        //     };

        //     var html = marked(enrichment.text, { renderer: customRenderer });

        resolve({element: element, replacement: tag})
      })
    })
  }

  findCitationAndGetReplacement (element) {
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
      }, 'word text author url', (err, definition) => {
        if (err) reject(err)

        // TODO: use template and insert element specifics
        var content = marked(definition.text)
        var tag = `<div class="citation hyphenate">
                     ${content}
                     <span class="author">${definition.author}</span>
                   </div>`
        resolve({element: element, replacement: tag})
      })
    })
  }

  findStoryAndGetReplacement (element) {
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
      }, 'word text author url', (err, definition) => {
        if (err) reject(err)

        // TODO: use template and insert element specifics
        var content = marked(definition.text)
        var tag = `<div class="story">${content}</div>`
        resolve({element: element, replacement: tag})
      })
    })
  }

  findIncludeAndGetReplacement (include) {
    return new Promise((resolve, reject) => {
      // legacy
      var type = this.type
      if (type === 'jahresbericht') {
        type = 'opMainzed'
      }

      File.findOne({'type': type, 'title': include.fileName}, 'markdown', (err, file) => {
        if (err) reject(err)
        resolve({include: include, replacement: file.markdown})
      })
    })
  }
}

function isValidType (type) {
  return type === 'jahresbericht' || type === 'olat'
}

function copyFolder (inPath, outPath) {
  return new Promise((resolve, reject) => {
    fse.copy(inPath, outPath, function (err) {
      if (err) reject(err)
      resolve()
    })
  })
}

function writeFile (outPath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outPath, content, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

function zipFolder (sourcePath, destPath) {
  var output = fs.createWriteStream(destPath)
  var archive = archiver('zip', {
    store: true // Sets the compression method to STORE.
  })
  archive.pipe(output)
  archive.directory(sourcePath, '')
  archive.finalize()
}

module.exports = Converter
