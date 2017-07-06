import Definition from './models/definition'

var fs = require('fs')
var path = require('path')
var cheerio = require('cheerio')
var marked = require('marked')

var renderers = require('./renderers/renderers')
// var Definition = require('./models/definition')
var File = require('./models/file')
var navigation = require('./navigation')

var RECIPES_PATH = '../recipes.json'

// Converts markdown to valid HTML as specified by a config file
class Converter {
  constructor (type = 'olat', markdown = 'This is **markdown**.') {
    if (!isValidType(type)) {
      console.log('unknown file type: ' + type)
    }
    this.type = type
    this.markdown = markdown
    this.recipe = {}
    this.page = {}
    this.elements = []
  }

  convert () {
    return new Promise((resolve, reject) => {
      this.getRecipe(this.type).then(() => {
        this.getPageFromTemplate().then(page => {
          this.getMetadata(this.markdown).then(markdown => {
            this.resolveIncludes(markdown).then(markdown => {
              this.markdown = markdown
              this.insertContent(page).then((page) => {
                this.resolveElements(page).then((page) => {
                  this.createGlossary(page).then((page) => {  // make synchronous
                    this.page = page

                    page = this.createTableOfFigures(page)

                    // nav as last step after all elements and tables finished
                    page = this.createNavigation(page)
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
    return new Promise((resolve, reject) => {
      var filePath = path.resolve(__dirname, RECIPES_PATH)
      fs.readFile(filePath, 'utf8', (err, jsonData) => {
        if (err) reject(err)
        try {
          var data = JSON.parse(jsonData)
          this.recipe = data[type]
          resolve(data[type])
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  getLegacyType () {
    if (this.type === 'jahresbericht') return 'opMainzed'
    if (this.type === 'olat') return 'opOlat'
    return this.type
  }

  /**
   * Gets the template path from recipe and loads it's content into a cheerio page object.
   * @returns {Object<Cheerio>}
   */
  getPageFromTemplate () {
    return new Promise((resolve, reject) => {
      const filePath = path.join(__dirname, '../', this.recipe['template-path'])

      // console.log(filePath)
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) reject(err)
        resolve(cheerio.load(data))
      })
    })
  }

  getTooltipFromTemplate (templatePath) {
    return new Promise((resolve, reject) => {
      var filePath = path.resolve(__dirname, '../', templatePath)
      fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) reject(err)
        resolve(data)
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
          if (promise.include && promise.replacement) {
            markdown = markdown.replace(promise.include.original, promise.replacement)
          }
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
      // get renders as function to reset counters
      var content = marked(this.markdown, { renderer: renderers[this.type]() })
      page(this.recipe['main-section-selector']).html(content)

      // legacy stories support
      var matches = page(this.recipe['main-section-selector']).html().match(/story{(.|\n)*?}story/g)
      if (matches) {
        matches.forEach((match, index) => {
          var content = match.replace('story{', '').replace('}story', '')
          var string = `<div class="story" id="story${index + 1}">${content}</div>`
          var newContent = page(this.recipe['main-section-selector']).html().replace(match, string)
          page(this.recipe['main-section-selector']).html(newContent)
        })
      }

      // insert title
      if (this.metadata.title) {
        this.recipe.metadata['title']['selectors'].forEach((selector) => {
          page(selector).text(this.metadata.title)
        })
      }

      // insert link to pdf
      if (this.metadata.pdfPath) {
        this.recipe.metadata['pdf-link']['selectors'].forEach((selector) => {
          page(selector).attr('href', this.metadata.pdfPath)
        })
      }

      // insert cover description
      if (this.metadata.coverDescription) {
        this.recipe.metadata['cover-description']['selectors'].forEach((selector) => {
          page(selector).text(this.metadata.coverDescription)
        })
      }
      resolve(page)
    })
  }

  /**
   * Creates a nav table from page elements and appends it to the page object.
   * @param {Object<Cheerio>} page
   * @returns {Object<Cheerio>} - A cheerio page object.
   */
  createNavigation (page) {
    if (!this.recipe['navigation']) return page  // skip
    return navigation[this.type](page, this.recipe)
  }

  createTableOfFigures (page) {
    if (!this.recipe['table-of-figures']) return page  // skip
    return navigation.addTableOfFigures(page)
  }

  // records and removes metadata from markdown
  getMetadata (markdown) {
    return new Promise((resolve, reject) => {
      this.metadata = {}
      var cleanMarkdown = markdown
      var matches

      if (this.recipe.metadata.title) {
        matches = cleanMarkdown.match(/^@title:(.*)/)
        if (matches) {
          this.metadata.title = matches[1].trim()  // save
          cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '') // remove
        }
      }

      if (this.recipe.metadata['cover-description']) {
        matches = cleanMarkdown.match(/^@cover-description:(.*)/)
        if (matches) {
          this.metadata.coverDescription = matches[1].trim()
          cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
        }
      }

      if (this.recipe.metadata['pdf-link']) {
        matches = cleanMarkdown.match(/^@pdf:(.*)/)
        if (matches) {
          this.metadata.pdfPath = matches[1].trim()
          cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
        }
      }

      resolve(cleanMarkdown)
    })
  }

  resolveElements (page) {
    return new Promise((resolve, reject) => {
      var promises = []
      this.elements = this.getElements(page)
      this.elements.forEach((element) => {
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
        promises.forEach((promise) => {
          if (promise.element && promise.replacement) {
            var newContent = page(this.recipe['main-section-selector']).html().replace(promise.element.markdown, promise.replacement)
            page(this.recipe['main-section-selector']).html(newContent)
          }
        })
        resolve(page)
      })
    })
  }

  /**
   * Gathers all custom elements from the page.
   * @param {Object<Cheerio>} page
   * @returns {Array<Elements>}
   */
  // returns a lit of all elements, their shortcut and type
  getElements (page) {
    const isValidCategory = category => ['definition', 'citation', 'story'].includes(category)
    var elementList = []

    // find them
    if (page(this.recipe['main-section-selector']).html()) { // page has content
      var elements = page(this.recipe['main-section-selector']).html().match(/\{(.*?)\}/g)
      if (elements) {
        elements.forEach((element) => {
          var content = element.replace('{', '').replace('}', '') // TODO: use regex

          var category
          var shortcut
          var placeholder

          const tokens = content.split(':')
          if (tokens.length < 2) {
            // { datenmodell }
            category = 'definition'
            shortcut = content.trim()
          } else if (tokens.length === 2 && isValidCategory(tokens[0].trim())) {
            // { definition: datenmodell }
            category = tokens[0].trim()
            shortcut = tokens[1].trim()
          } else if (tokens.length === 2 && !isValidCategory(tokens[0].trim())) {
            // { datenmodell: datenmodells }
            category = 'definition'
            shortcut = tokens[0].trim()
            placeholder = tokens[1].trim()
          } else if (tokens.length === 3) {
            // { definition: datenmodell: datenmodells }
            category = tokens[0].trim()
            shortcut = tokens[1].trim()
            placeholder = tokens[2].trim()
          } else {
            console.error('unknown definition format')
          }

          elementList.push({
            markdown: element,
            category: category,
            shortcut: shortcut,
            placeholder: placeholder
          })
        })
      }
    }

    // replace one by one to add custom ID for each
    // var counter = 1;
    // if (matches) {
    //     for (var i = 0; i < matches.length; i++) {
    //         //console.log("replacing!");
    //         //console.log()
    //         html = html.replace(/<p>story{<\/p>/, '<div class="story" id="story' + counter + '">');
    //         counter++;
    //     }
    // }
    //
    // // replace closing tags all at once -> no id needed
    // html = html.replace(/<p>}story<\/p>/g, "</div>");

    return elementList
  }

  /**
   * Looks up the element in the definition collection and creates the replacement.
   * @param {Object} element
   * @returns {Object}
   */
  findDefinitionAndGetReplacement (element) {
    return new Promise((resolve, reject) => {
      let type = this.getLegacyType()

      Definition.findOne({
        'filetype': type,
        'word': element.shortcut,
        'category': element.category
      }, 'word text author url', (err, definition) => {
        if (err) reject(err)

        if (definition) {  // is defined
          var word = element.placeholder ? element.placeholder : definition.word

          // TODO: use template and insert element specifics
          var tag = ''

          if (this.type === 'jahresbericht') {
            tag = `
              <span id="${definition._id}" class="shortcut">
                ${word}
                <span class="definition">
                  <span class="definition-title">${definition.word}</span>
                  <span class="definition-text">${definition.text}</span>
                  <span class="definition-author">${definition.author}</span>
                  <span class="definition-website">${definition.url}</span>
                </span>
              </span>
            `
          } else if (this.type === 'olat') {
            tag = `<a href="#definitions-table" title="${definition.text}" class="definition">${definition.word}</a>`
          }
        } else {  // definition not found in database
          resolve({})
        }
        resolve({ element: element, replacement: tag })
      })
    })
  }

  findCitationAndGetReplacement (element) {
    return new Promise((resolve, reject) => {
      let type = this.getLegacyType()

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
      let type = this.getLegacyType()

      Definition.findOne({
        'filetype': type,
        'word': element.shortcut,
        'category': element.category
      }, 'word text author url', (err, definition) => {
        if (err) reject(err)
        if (definition && definition.text) {
          // TODO: use template and insert element specifics
          var content = marked(definition.text)
          var tag = `<div class="story">${content}</div>`
          resolve({element: element, replacement: tag})
        }
        resolve({})
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
        if (file && file.markdown) {
          resolve({include: include, replacement: file.markdown})
        }
        resolve({})
      })
    })
  }

  /**
   * Queries the database for an element.
   * @param {Object} element - An enrichment object.
   * @returns {Promise<Definition>} - A definition instance.
   */
  getElement (element) {
    return new Promise((resolve, reject) => {
      let type = this.getLegacyType()
      Definition.findOne({
        'filetype': type,
        'word': element.shortcut,
        'category': element.category
      }, 'word text author url', (err, definition) => {
        if (err) reject(err)
        resolve(definition)
      })
    })
  }

  /**
   * Creates a glossary with all used definitions and appends it to the section
   * specified in the recipes.json.
   * @param {Object<Cheerio>} page
   * @returns {Promise<Cheerio>} - Cheerio object.
   */
  createGlossary (page) {
    return new Promise((resolve, reject) => {
      let elements = this.elements
      let promises = []

      if (this.recipe['glossary'] && this.recipe['glossary']['selectors']) {
        // get all definitions
        elements.forEach((element) => {
          if (element.category === 'definition') {
            promises.push(this.getElement(element))
          }
        })

        Promise.all(promises).then((promises) => {
          this.recipe['glossary']['selectors'].forEach((selector) => {
            // create glossary structure
            page(selector).append('<h4>Glossar</h4>\n')
            page(selector).append('<ul></ul>\n')

            // append definitions
            let usedElements = []
            promises.forEach((element) => {
              if (element) {
                if (!usedElements.find((x) => x.word === element.word)) {
                  const DEF_STRING = `<li>
                                      <a href="#" target="_blank" class="definition" title="${element.text}">
                                        ${element.word}
                                      </a>
                                    </li>\n`
                  page(selector).find('ul').append(DEF_STRING)
                  usedElements.push(element)
                }
              }
            })
          })
          resolve(page)  // created
        })
      } else {
        resolve(page)  // not created
      }
    })
  }
}

function isValidType (type) {
  return type === 'jahresbericht' || type === 'olat'
}

export default Converter
