var marked = require('marked')

/**
 * Specific renderer for the OLAT document type.
 * @returns {marked.Renderer}
 */
var olat = () => {
  var renderer = new marked.Renderer()

  // custom heading renderer
  renderer.headerCounter = 0
  renderer.heading = function (text, level) {
    renderer.headerCounter++
    return `<h${level} id="h${level}-${renderer.headerCounter}">${text}</h${level}>\n`
  }

  renderer.link = function (linkUrl, noIdea, text) {
    return `<a href="${linkUrl}" target="_blank">${text}</a>`
  }

  renderer.imageCounter = 1
  renderer.image = function (src, title, alt) {
    // used title attr for caption, author etc
    var tokens = title.split('; ')
    var caption = tokens[0].replace(/\\/g, '')
    var preCaption = 'Abb.' + renderer.imageCounter
    renderer.imageCounter++

    return `<figure id="${alt}">\n
            <img src="${src}" alt="${alt}">
            <figcaption>\n
              <span class="pre-caption">${preCaption}<br></span>
              <span class="caption">${caption}<br></span>
              <a href="#images-table">(Quelle)</a>
            </figcaption>\n
            </figure>\n`
  }
  return renderer
}

module.exports = olat
