var marked = require('marked')

/**
 * Specific renderer for the Mainzed Jahresbericht document type.
 * @returns {marked.Renderer}
 */
var jahresbericht = () => {
  var renderer = new marked.Renderer()

  var h1Counter = 0
  var h2Counter = 0
  var h3Counter = 0
  renderer.heading = function (text, level) {
    if (level === 1) {
      h1Counter++
      h2Counter = 0
      h3Counter = 0
      return `<h1 id="section-${h1Counter}" class="hyphenate">${text}</h1>\n`
    } else if (level === 2) {
      h2Counter++
      h3Counter = 0
      return `<h2 id="section-${h1Counter}-${h2Counter}" class="hyphenate">${text}</h2>\n`
    } else if (level === 3) {
      h3Counter++
      return `<h3 id="section-${h1Counter}-${h2Counter}-${h3Counter}" class="hyphenate">${text}</h3>\n`
    }
  }

  renderer.link = function (linkUrl, noIdea, text) {
    if (linkUrl.startsWith('#')) {
      return `<a href="${linkUrl}" class="internal-link">${text}</a>`
    } else {
      return `<a href="${linkUrl}" class="external-link" target="_blank">${text}</a>`
    }
  }

  return renderer
}

module.exports = jahresbericht
