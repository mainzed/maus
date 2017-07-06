function addOlatTableOfContent (page, recipe) {
  const $headers = page('h1')
  const $stories = page('.story')
  const $imagesTable = page('#images-table')
  const $glossary = page('#definitions-table')
  const $table = page('#headings-table')

  page(recipe['navigation']['selector']).append('<ul></ul>')

  // append link to page-title it it exists
  // if ($("#page-title", page).length > 0) {
  //     $("#headings-table ul", page).append("<li><a href=\"#page-title\">Top</a></li>");
  //
  //     // add seperator
  //     $("#headings-table ul", page).append('<li class="seperator"></li>');
  // }

  if ($headers && $headers.length > 0) {
    $headers.each((index, value) => {
      const id = page(value).attr('id')
      const name = page(value).text()
      const string = `<li><a href="#${id}">${name}</a></li>\n`
      $table.find('ul').append(string)
    })
  }

  if ($stories && $stories.length > 0) {
    $table.append('<li class="seperator"></li>')
    $stories.each((index, value) => {
      const id = page(value).attr('id')
      const string = `<li class="story"><a href="#${id}">Story Teil ${index + 1}</a></li>`
      $table.find('ul').append(string)
    })
  }

  // add seperator if images, links or definitions table exist
  if (($imagesTable && $imagesTable.length > 0) || ($glossary && $glossary.length > 0)) {
    $table.find('ul').append('<li class="seperator"></li>')
  }

  // add link to images table if it exists
  if ($imagesTable && $imagesTable.length > 0) {
    $table.find('ul').append('<li><a href="#images-table">Abbildungen</a></li>')
  }

  // add link to definitions-table if it exists
  if ($glossary && $glossary.length > 0) {
    $table.find('ul').append('<li><a href="#definitions-table">Glossar</a></li>')
  }

  return page
}

function jahresbericht (page) {
  const $headers = page('h1, h2')
  const $nav = page('#nav')

  let previousHeadingLevel = 0

  if ($headers && $headers.length > 0) {
    $headers.each((index, value) => {
      if (index > 0) {  // skip jahresbericht title
        const id = page(value).attr('id')
        const text = page(value).text()
        const string = `<a href="#${id}">${text}</a>`

        // append string based on level
        if (page(value).is('h1')) {
          $nav.append(`<li>${string}</li>`)
          previousHeadingLevel = 1
        } else if (page(value).is('h2')) {
          if (previousHeadingLevel === 1) {
            // if previous was 1, open new ul and append li
            page('#nav li').last().append(`<ul><li>${string}</li></ul>`)
          } else if (previousHeadingLevel === 2) {
            //  if previous was 2, just append to ul
            page('#nav ul').last().append(`<li>${string}</li>`)
          }
          previousHeadingLevel = 2
        }
      }
    })
  }

  // prepend link to cover
  $nav.prepend('<li><a href="#titlepicture">Cover</a></li>')
  // append link to imprint
  $nav.append('<li><a href="#imprint">Impressum</a></li>')

  return page
}

function addTableOfFigures (page) {
  const $figures = page('figure')
  const $table = page('#images-table')

  if ($figures && $figures.length > 0) {
    $table.append('<h4>Abbildungen</h4><ul></ul>')
    $figures.each((index, value) => {
      const name = page(value).find('figcaption .pre-caption').text()
      const caption = page(value).find('figcaption .caption').text()
      var string = `<li>
                     ${name}<br>
                     ${caption}
                    </li>`
      $table.find('ul').append(string)
    })
  }
  return page
}

module.exports = {
  olat: addOlatTableOfContent,
  jahresbericht: jahresbericht,
  addTableOfFigures: addTableOfFigures
}
