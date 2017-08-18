var File = require('./models/file')

class Exporter {
  /**
   * creates map for all stuff that has to be replaced
   * @param {*} input
   */
  getMapping (input) {
    const mapping = []
    let counter = 1
    let sectionCounter = 0
    let pictureCounter = 1

    // matches headings, definitions and links
    const matches = input.match(/(#+?\s(\w.*)|{\s?\w*:\s(.*?)}|(?:__|[*])|\[(.*?)\]\(.*?\))/g)
    if (!matches) return mapping
    matches.forEach(match => {
      // reset counter for each main section
      if (match.startsWith('#') && !match.startsWith('##')) { // is h1
        sectionCounter++
        counter = 1
        pictureCounter = 1
      } else if (match.startsWith('[')) { // is link
        mapping.push({
          section: sectionCounter,
          footnote: counter,
          type: 'link',
          placeholder: match
        })
        counter++
      } else if (match.includes('definition:')) { // is definition
        console.log(match)
        mapping.push({
          section: sectionCounter,
          footnote: counter,
          type: 'definition',
          placeholder: match
        })
        counter++
      } else if (match.includes('citation:')) { // is definition
        mapping.push({
          type: 'citation',
          placeholder: match
        })
      } else if (match.includes('picture:')) { // is definition
        mapping.push({
          section: sectionCounter,
          type: 'picture',
          placeholder: match,
          number: pictureCounter
        })
        pictureCounter++
      } else if (match.includes('picturegroup:')) {
        const pictures = match.split(':')[1].replace('}', '').split(',')
        const pics = []
        pictures.forEach((pic) => {
          pics.push({ id: pic.trim(), number: pictureCounter })
          pictureCounter++
        })
        mapping.push({
          section: sectionCounter,
          type: 'picturegroup',
          placeholder: match,
          pictures: pics
        })
      }
    })
    return mapping
  }

  // dont need definitions, since just the word is used
  resolveMapping (input, mapping, citations=[], pictures=[]) {
    let markdown = input
    mapping.forEach(token => {
      if (token.type === 'link') {
        const link = token.placeholder.split(']')[0].replace('[', '').trim()
        markdown = markdown.replace(
          token.placeholder,
          `${link} [${token.footnote}]`
        )
      } else if (token.type === 'definition') {
        const definition = token.placeholder.split(':')[1].replace('}', '').trim()
        markdown = markdown.replace(
          token.placeholder,
          `${definition} [${token.footnote}]`
        )
      } else if (token.type === 'citation') {
        const shortcut = token.placeholder.split(':')[1].replace('}', '').trim()
        let citation = citations.find(cit => cit.word === shortcut)
        if (citation) {
          markdown = markdown.replace(
            token.placeholder,
            `> ${citation.text}\n${citation.author}`
          )
        }
      } else if (token.type === 'picture') {
        const shortcut = token.placeholder.split(':')[1].replace('}', '').trim()
        let picture = pictures.find(pic => pic.word === shortcut)
        if (picture) {
          markdown = markdown.replace(
            token.placeholder,
            `<${picture.url}>\nAbb. ${token.number}: ${picture.text}`
          )
        }
      } else if (token.type === 'picturegroup') {
        let urls = ''
        let captions = ''
        token.pictures.forEach(element => {
          let picture = pictures.find(pic => pic.word === element.id)
          if (picture) {
            urls += `<${picture.url}>\n`
            captions += `Abb. ${element.number}: ${picture.text}\n`
          }
        })
        markdown = markdown.replace(token.placeholder, urls + captions)
      }
    })
    return markdown
  }

  /**
   * Expects used definitions in array
   */
  getFootnotes (mapping, definitonsArr=[]) {
    let output = ''

    let currSection = 0
    mapping.forEach((token) => {
      if (token.section && token.section > currSection) {
        currSection = token.section
        output += `\n# Kapitel ${currSection}\n`
      }
      if (token.type === 'link') {
        let url = token.placeholder.split(']')[1].replace('(', '').replace(')', '').trim()
        output += `${token.footnote}. ${url}\n`
      } else if (token.type === 'definition') {
        // get definition details
        const shortcut = token.placeholder.split(':')[1].replace('}', '').trim()
        let definition = definitonsArr.find(def => def.word === shortcut)
        if (definition) {
          let defString = `${token.footnote}. ${definition.text}`
          if (definition.author) defString += `\nAutor: ${definition.author}`
          if (definition.url) defString += `, Webressource: ${definition.url}`
          output += defString + '\n'
        }
      }
    })
    return output
  }
}

module.exports = Exporter
