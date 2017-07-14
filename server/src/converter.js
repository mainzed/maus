import Resolver from './resolver'
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
const MAIN_SECTION_SELECTOR = '#main'
const GLOSSARY_SELECTOR = '#glossary'
const PDF_SELECTOR = '#pdf'

// Converts markdown to valid HTML as specified by a config file
class Converter {
  constructor (type = 'olat', markdown = 'This is **markdown**.') {
    if (!isValidType(type)) {
      console.log('unknown file type: ' + type)
    }
    this.type = type
    this.markdown = markdown
    this.content = undefined // cheerio html just content
    // this.template = ''
    this.recipe = {}
    this.page = undefined // cheerio html incl template
    this.elements = []
  }

  convert () {
    return new Promise((resolve, reject) => {
      this.getRecipe(this.type).then(() => {
        // pre-process markdown
        this.prepareMarkdown().then(() => {
          // convert markdown to html
          this.convertContent().then(() => {
            // get template and put content in it
            this.getTemplate().then(templateHTMLString => {
              // create cheerio object from template string and insert content
              this.fillTemplate(templateHTMLString)

              // the following steps have to be executed on entire page incl header

              // post-processing
              this.addMetada()

              if (this.recipe['navigation']) this.addNavigation()
              if (this.recipe['addTableOfFigures']) this.addTableOfFigures()

              // TODO: check if they can be done synchronous
              if (this.recipe['glossary']) {
                this.addGlossary().then(() => {
                  resolve(this.page.html())
                }).catch(err => reject(err))
              } else {
                resolve(this.page.html())
              }
            })
          })
        })
      })
      .catch((err) => reject(err))
    })
  }

  // prepares markdown content (resolves includes, removes metadata)
  // sets this.metadata
  // processes this.markdown
  prepareMarkdown () {
    return new Promise((resolve, reject) => {
      // clean markdown
      const cleanMarkdown = this.getMetadata(this.markdown)

      // resolve includes
      this.resolveIncludes(cleanMarkdown).then(markdown => {
        this.markdown = markdown
        resolve()
      }).catch(err => reject(err))
    })
  }

  // convert markdown to html and sets cheerio object
  convertContent () {
    return new Promise((resolve, reject) => {
      // markdown to html
      const content = marked(this.markdown, { renderer: renderers[this.type]() })
      this.content = cheerio.load(content)

      // this.resolveLegacyStories()

      // resolve elements
      let resolver = new Resolver(content)
      resolver.resolveElements().then(html => {
        this.content = html
        resolve()
      }).catch(err => reject(err))
    })
  }

  fillTemplate (templateHTMLString) {
    if (!templateHTMLString) throw Error('Method requires an html string to be passed as a parameter')
    this.page = cheerio.load(templateHTMLString)

    // insert processed content (already has processed defnitions etc)
    this.page(MAIN_SECTION_SELECTOR).html(this.content('body').html())
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
  getTemplate () {
    return new Promise((resolve, reject) => {
      const filePath = path.join(__dirname, '../', this.recipe['template-path'])

      // console.log(filePath)
      fs.readFile(filePath, 'utf8', (err, data) => {
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

  addMetada () {
    // insert title
    if (this.metadata && this.metadata.title) {
      this.recipe.metadata['title']['selectors'].forEach((selector) => {
        this.page(selector).text(this.metadata.title)
      })
    }

    // insert link to pdf
    if (this.metadata && this.metadata.pdfPath) {
      this.page(PDF_SELECTOR).attr('href', this.metadata.pdfPath)
    }

    // insert cover description
    if (this.metadata && this.metadata.coverDescription) {
      this.recipe.metadata['cover-description']['selectors'].forEach((selector) => {
        this.page(selector).text(this.metadata.coverDescription)
      })
    }
  }

  // legacy stories support
  resolveLegacyStories () {
    console.log(this.content(MAIN_SECTION_SELECTOR).html())
    var matches = this.content(MAIN_SECTION_SELECTOR).html().match(/story{(.|\n)*?}story/g)
    if (matches) {
      matches.forEach((match, index) => {
        var content = match.replace('story{', '').replace('}story', '')
        var string = `<div class="story" id="story${index + 1}">${content}</div>`
        var newContent = this.content(MAIN_SECTION_SELECTOR).html().replace(match, string)
        this.content(MAIN_SECTION_SELECTOR).html(newContent)
      })
    }
  }

  /**
   * Creates a nav table from page elements and appends it to the page object.
   * @returns {Object<Cheerio>} - A cheerio page object.
   */
  addNavigation () {
    return navigation[this.type](this.page, this.recipe)
  }

  addTableOfFigures (page) {
    return navigation.addTableOfFigures(this.page)
  }

  // records and removes metadata from markdown
  getMetadata (markdown) {
    this.metadata = {}
    let cleanMarkdown = markdown
    let matches

    matches = cleanMarkdown.match(/^@author:(.*)/)
    if (matches) {
      this.metadata.author = matches[1].trim()  // save
      cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '') // remove
    }

    matches = cleanMarkdown.match(/^@title:(.*)/)
    if (matches) {
      this.metadata.title = matches[1].trim()  // save
      cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '') // remove
    }

    matches = cleanMarkdown.match(/^@cover-description:(.*)/)
    if (matches) {
      this.metadata.coverDescription = matches[1].trim()
      cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
    }

    matches = cleanMarkdown.match(/^@pdf:(.*)/)
    if (matches) {
      this.metadata.pdfPath = matches[1].trim()
      cleanMarkdown = cleanMarkdown.replace(matches[0] + '\n', '')
    }
    return cleanMarkdown
  }

  resolveElements () {
    return new Promise((resolve, reject) => {
      var promises = []
      this.elements = this.getElements()
      this.elements.forEach((element) => {
        if (element.category === 'definition') {
          console.log('FOUND DEFINITION')
          promises.push(this.findDefinitionAndGetReplacement(element))
        } else if (element.category === 'citation') {
          promises.push(this.findCitationAndGetReplacement(element))
        } else if (element.category === 'story') {
          promises.push(this.findStoryAndGetReplacement(element))
        }
      })

      // actually replace them
      Promise.all(promises).then((promises) => {
        console.log(promises)
        promises.forEach((promise) => {
          if (promise.element && promise.replacement) {
            console.log(promise.element)
            var newContent = this.content('body').html().replace(promise.element.markdown, promise.replacement)
            this.content('body').html(newContent)
          }
        })
        resolve()
      })
    })
  }

  /**
   * Gathers all custom elements from the page. Uses this.content
   * @returns {Array<Elements>}
   */
  // returns a lit of all elements, their shortcut and type
  getElements () {
    const isValidCategory = category => ['definition', 'citation', 'story'].includes(category)
    var elementList = []

    // find them
    if (this.content.html()) { // page has content
      var elements = this.content.html().match(/\{(.*?)\}/g)
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
      const type = this.getLegacyType()
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
   * @returns {Promise<Cheerio>} - Cheerio object.
   */
  addGlossary () {
    return new Promise((resolve, reject) => {
      let elements = this.elements
      let promises = []

      // get all definitions
      elements.forEach((element) => {
        if (element.category === 'definition') {
          promises.push(this.getElement(element))
        }
      })

      Promise.all(promises).then((promises) => {
        // create glossary structure
        this.page(GLOSSARY_SELECTOR).append('<h4>Glossar</h4>\n')
        this.page(GLOSSARY_SELECTOR).append('<ul></ul>\n')

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
              this.page(GLOSSARY_SELECTOR).find('ul').append(DEF_STRING)
              usedElements.push(element)
            }
          }
        })
        resolve()  // created
      })
    })
  }
}

function isValidType (type) {
  return type === 'jahresbericht' || type === 'olat'
}

export default Converter
