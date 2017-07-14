import Definition from './models/definition'

var cheerio = require('cheerio')
var marked = require('marked')

var renderers = require('./renderers/renderers')
var File = require('./models/file')

const MAIN_SECTION_SELECTOR = '#main'

// resolves all custom elements from html content and returns ?
class Resolver {
  constructor (htmlString) {
    this.$page = cheerio.load(htmlString)
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

  /**
   * Gathers all custom elements from the page. Uses this.content
   * @returns {Array<Elements>}
   */
   // needs this.$page to be set
  // returns a lit of all elements, their shortcut and type
  getElements () {
    const isValidCategory = category => ['definition', 'citation', 'story'].includes(category)
    var elementList = []

    // find them
    if (this.$page.html()) { // page has content
      var elements = this.$page.html().match(/\{(.*?)\}/g)
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

    return elementList
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

  resolve () {
    return new Promise((resolve, reject) => {
      var promises = []
      const elements = this.getElements(this.$page)

      elements.forEach((element) => {
        if (element.category === 'definition') {
          console.log('FOUND DEFINITION')
          promises.push(this.findDefinitionAndGetReplacement(element))
        } else if (element.category === 'citation') {
          promises.push(this.findCitationAndGetReplacement(element))
        } else if (element.category === 'story') {
          promises.push(this.findStoryAndGetReplacement(element))
        }
      })
      console.log(elements)

      // actually replace them
      Promise.all(promises).then((promises) => {
        promises.forEach((promise) => {
          if (promise.element && promise.replacement) {
            var newContent = this.$page('body').html().replace(promise.element.markdown, promise.replacement)
            this.$page('body').html(newContent)
          }
        })
        resolve()
      })
    })
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
          resolve({ include: include, replacement: file.markdown })
        }
        resolve({})
      })
    })
  }
}

export default Resolver
