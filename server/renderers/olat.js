var marked = require('marked')

var olat = new marked.Renderer()

// custom heading renderer
var counter = 0
olat.heading = function (text, level) {
  counter++
  return `<h${level} id="h${level}-${counter}">${text}</h${level}>\n`
}

olat.link = function (linkUrl, noIdea, text) {
  return `<a href="${linkUrl}" target="_blank">${text}</a>`
}

var ImageCounter = 1
olat.image = function (src, title, alt) {
  // used title attr for caption, author etc
  var tokens = title.split('; ')
  var caption = tokens[0].replace(/\\/g, '')
  var preCaption = 'Abb.' + ImageCounter
  ImageCounter++

  return `<figure id="${alt}">\n
          <img src="${src}" alt="${alt}">
          <figcaption>\n
            <span class="pre-caption">${preCaption}<br></span>
            <span class="caption">${caption}<br></span>
            <a href="#images-table">(Quelle)</a>
          </figcaption>\n
          </figure>\n`
}

module.exports = olat
