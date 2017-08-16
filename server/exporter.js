var File = require('./models/file')

class Exporter {
  constructor (file) {
    if (file.constructor.name !== 'model') throw new Error('not a valid mongoose object')
    this.file = file
    this.counter = 1
  }

  /**
   * Replace citation with blockquotes given it's ID and it's citation obj
   * @returns {string} replaced markdown
   */
  replaceCitation (citationID, citationObj) {
    let markdown = this.file.markdown
    const matches = this.file.markdown.match(`{ citation: ${citationID} }`, 'g')
    matches.forEach(match => {
      markdown = markdown.replace(match, `> ${citationObj.text}`)
    })
    return markdown
  }

  replaceDefinitions (input) {
    let markdown = input
    const matches = markdown.match(/{\sdefinition:\s(.*?)}/g)
    matches.forEach(match => {
      const text = match.split(':')[1].replace('}', '').trim()
      markdown = markdown.replace(match, `${text} ({{#}})`)
    })
    return markdown
  }

  /**
   * Remove urls from links.
   */
  replaceLinks (markdown) {
    const matches = markdown.match(/(?:__|[*])|\[(.*?)\]\(.*?\)/g)
    matches.forEach(match => {
      const text = match.split(']')[0].replace('[', '')
      markdown = markdown.replace(match, `${text} ({{#}})`)
    })
    return markdown
  }

  /**
   * Replace placeholders with actual numbers
   */
  replaceNumberPlaceholders (input) {
    let markdown = input
    let counter = 1
    const matches = markdown.match(/({{#}}|#+?\s(\w.*))/g) // matches placeholders and headings
    matches.forEach(match => {
      // reset counter for each main section
      if (match.startsWith('#') && !match.startsWith('##')) { // is h1
        counter = 1
      } else if (match === '{{#}}') {
        markdown = markdown.replace(match, counter)
        counter++
      }
    })
    return markdown
  }

  export (input) {
    let markdown = input
    markdown = this.replaceLinks(markdown)
    markdown = this.replaceDefinitions(markdown)
    markdown = this.replaceNumberPlaceholders(markdown)
    return markdown
  }
}

module.exports = Exporter
