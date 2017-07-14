import chai from 'chai'
import Converter from '../src/converter'
import chaiAsPromised from 'chai-as-promised'
import * as cheerio from 'cheerio'
import Definition from '../src/models/definition'

chai.use(chaiAsPromised)

let should = chai.should()

describe('Converter', () => {
  let converter = {}
  let defID

  before(done => {
    // create a definition to test resolves
    const definition = {
      category: 'definition',
      word: 'def1',
      text: 'This is an example definition.',
      filetype: 'opMainzed'
    }
    Definition.create(definition, (err, def) => {
      if (err) done(err)
      defID = def._id
      done()
    })

    converter = new Converter('jahresbericht', 'some markdown!')
  })

  after(done => {
    Definition.collection.drop()
    done()
  })

  it('should init new converter with default parameters', () => {
    const converter = new Converter()
    converter.should.not.be.undefined
    converter.should.be.a('object')
    converter.should.have.property('type')
    converter.should.have.property('markdown')
    converter.should.have.property('recipe')
    converter.should.have.property('page')
    converter.should.have.property('elements')

    converter.type.should.equal('olat')
    converter.markdown.should.equal('This is **markdown**.')

    // methods
    converter.should.have.property('convert')
    converter.convert.should.be.a('function')

    converter.should.have.property('getRecipe')
    converter.getRecipe.should.be.a('function')

    converter.should.have.property('addGlossary')
    converter.addGlossary.should.be.a('function')
    // ...
  })

  it('should init new converter with given parameters', () => {
    const converter = new Converter('jahresbericht', 'some markdown!')
    converter.should.not.be.undefined
    converter.should.be.a('object')
    converter.type.should.equal('jahresbericht')
    converter.markdown.should.equal('some markdown!')
  })

  // it('convert() should return valid html', done => {
  //   converter.convert().then((html) => {
  //     html.should.be.a('string')
  //
  //     // check if markdown has been inserted
  //     const page = cheerio.load(html)
  //     page.should.be.not.undefined
  //     page('#read').html().should.equal('<p>some markdown!</p>\n')
  //
  //     done()
  //   }).catch(err => done(err))
  // })

  it('getRecipe() should return recipe when given filetype', done => {
    converter.getRecipe(converter.type).then(recipe => {
      recipe.should.be.a('object')
      recipe.should.have.property('template-path')
      recipe.should.have.property('metadata')
      // ...
      done()
    }).catch((err) => console.log(err))
  })

  it('getLegacyType() should return valid type', () => {
    const type = converter.getLegacyType()
    type.should.equal('opMainzed')
  })

  describe('Prepare markdown', () => {
    it('getMetadata() should record and remove metadata from markdown', () => {
      const markdown = '@author: Max\nThis **markdown** contains metadata!'
      const result = converter.getMetadata(markdown)
      result.should.be.eql('This **markdown** contains metadata!')
      converter.metadata.should.be.a('object')
      converter.metadata.should.have.property('author')
      converter.metadata['author'].should.be.eql('Max')
    })

    it('Includes', () => {
      it('getIncludes()')
      it('resolveIncludes()')
    })

    it('prepareMarkdown()', done => {
      converter.markdown = '@author: Max\nThis **markdown** contains metadata!'
      converter.markdown.should.not.have.property('author')
      converter.prepareMarkdown().then(() => {
        converter.markdown.should.be.eql('This **markdown** contains metadata!')
        converter.metadata.should.have.property('author')
        converter.metadata.author.should.eql('Max')
        done()
      }).catch(err => done(err))
    })
  })

  describe('Conversion', () => {
    it('getElements() should record definitions (with & w/o placeholders)', () => {
      converter.content = cheerio.load(`
        <p>
        some markdown and a { definition: someDef }
        as well as a definition with { definition: someDef: somePlaceholder }
        </p>
      `)
      const result = converter.getElements()
      result.should.be.a('array')
      result.length.should.be.eql(2)

      // without placeholder
      result[0].should.have.property('markdown')
      result[0].markdown.should.be.eql('{ definition: someDef }')

      result[0].should.have.property('category')
      result[0].category.should.be.eql('definition')

      result[0].should.have.property('shortcut')
      result[0].shortcut.should.be.eql('someDef')

      result[0].should.have.property('placeholder')
      should.equal(result[0].placeholder, undefined)

      // with placeholder
      result[1].should.have.property('markdown')
      result[1].markdown.should.be.eql('{ definition: someDef: somePlaceholder }')

      result[1].should.have.property('category')
      result[1].category.should.be.eql('definition')

      result[1].should.have.property('shortcut')
      result[1].shortcut.should.be.eql('someDef')

      result[1].should.have.property('placeholder')
      result[1].placeholder.should.be.eql('somePlaceholder')
    })

    it('getElements() should record legacy definitions (with & w/o placeholders)', () => {
      converter.content = cheerio.load(`
        <div id="main">
          some markdown and a { legacyDef }
          and with a placeholder { legacyDef: placeholder }
        </div>
      `)
      const result = converter.getElements()
      result.should.be.a('array')
      result.length.should.be.eql(2)

      // without placeholder
      result[0].should.have.property('markdown')
      result[0].markdown.should.be.eql('{ legacyDef }')

      result[0].should.have.property('category')
      result[0].category.should.be.eql('definition')

      result[0].should.have.property('shortcut')
      result[0].shortcut.should.be.eql('legacyDef')

      result[0].should.have.property('placeholder')
      should.equal(result[0].placeholder, undefined)

      // with placeholder
      result[1].should.have.property('markdown')
      result[1].markdown.should.be.eql('{ legacyDef: placeholder }')

      result[1].should.have.property('category')
      result[1].category.should.be.eql('definition')

      result[1].should.have.property('shortcut')
      result[1].shortcut.should.be.eql('legacyDef')

      result[1].should.have.property('placeholder')
      result[1].placeholder.should.be.eql('placeholder')
    })

    it('getElements() should record citations', () => {
      converter.content = cheerio.load(`
        <div id="main">
          some markdown and a { citation: cit1 }
        </div>
      `)
      const result = converter.getElements()
      result.should.be.a('array')
      result.length.should.be.eql(1)

      result[0].markdown.should.be.eql('{ citation: cit1 }')
      result[0].category.should.be.eql('citation')
      result[0].shortcut.should.be.eql('cit1')
    })

    it('getElements() should record stories', () => {
      converter.content = cheerio.load(`
        <div id="main">
          some markdown and a { story: story1 }
        </div>
      `)
      const result = converter.getElements()
      result.should.be.a('array')
      result.length.should.be.eql(1)

      result[0].markdown.should.be.eql('{ story: story1 }')
      result[0].category.should.be.eql('story')
      result[0].shortcut.should.be.eql('story1')
    })

    it('findDefinitionAndGetReplacement() should create definition content', done => {
      const element = {
        markdown: '{ definition: def1 }',
        category: 'definition',
        shortcut: 'def1'
      }

      converter.findDefinitionAndGetReplacement(element).then((result) => {
        result.should.have.property('element')
        result.should.have.property('replacement')

        const expected = `
          <span id="${defID}" class="shortcut">
            def1
            <span class="definition">
              <span class="definition-title">def1</span>
              <span class="definition-text">This is an example definition.</span>
              <span class="definition-author">undefined</span>
              <span class="definition-website">undefined</span>
            </span>
          </span>
        `.replace(/\s/g, '')
        const actual = result.replacement.replace(/\s/g, '')
        actual.should.be.eql(expected)
        done()
      }).catch(err => done(err))
    })

    it('findCitationAndGetReplacement()')
    it('findStoryAndGetReplacement()')
    it('findIncludeAndGetReplacement()')
    it('getElement()')

    it('resolveElements() given html content should resolve definitions', done => {
      converter.content = cheerio.load('<p>This markdown contains a { definition: def1 }!</p>')
      converter.resolveElements().then(() => {
        converter.content('body').html().replace(/\s/g, '').should.be.eql(`
          <p>This markdown contains a
            <span id="${defID}" class="shortcut">
              def1
              <span class="definition">
                <span class="definition-title">def1</span>
                <span class="definition-text">This is an example definition.</span>
                <span class="definition-author">undefined</span>
                <span class="definition-website">undefined</span>
              </span>
            </span>
          !</p>
        `.replace(/\s/g, ''))
      }).catch(err => done(err))
    })

    it('convertContent() should create valid html', done => {
      converter.markdown = 'This **markdown** contains metadata!'
      converter.convertContent().then(() => {
        converter.content('body').should.not.be.undefined
        converter.content('body').html().replace(/\s/g, '').should.be.eql(`
          <p>This <strong>markdown</strong> contains metadata!</p>\n`.replace(/\s/g, ''))
        done()
      }).catch(err => done(err))
    })

    // it('convertContent() should resolve defnitions', done => {
    //   converter.markdown = 'This **markdown** contains a { definition: def1 }!'
    //   converter.convertContent().then(() => {
    //     converter.content('body').should.not.be.undefined
    //     converter.content('body').html().should.be.eql(`<p>This <strong>markdown</strong> contains metadata!</p>\n`)
    //     done()
    //   }).catch(err => done(err))
    // })

    it('resolveLegacyStories()')
    it('convertContent() should resolve includes')
  })

  describe('fill template', () => {
    it('getTemplate() given should return string', done => {
      converter.recipe['template-path'] = 'templates/jahresbericht/main.html'
      converter.getTemplate().then(data => {
        data.should.be.a('string')
        done()
      }).catch(err => done(err))
    })

    it('fillTemplate() should throw error when no parameters provided', () => {
      (function () {
        converter.fillTemplate()
      }).should.throw(Error, 'Method requires an html string to be passed as a parameter')
    })

    it('fillTemplate() given an html string should create a Cheerio page object', () => {
      converter.content = cheerio.load('<p>This is some content</p>')
      converter.fillTemplate('<html><head></head><body><div id="main"></div></body></html>')
      converter.page.html().should.include('<p>This is some content</p>')
    })
  })

  describe('Post-Processing', () => {
    before(done => {
      converter.markdown = 'This **markdown** contains metadata!'
      converter.convertContent()
        .then(() => done()) // sets converter.page
        .catch((err) => done(err))
    })
    // it('addGlossary()', () => {
    //   converter.addGlossary
    // })
    it('addGlossary()')
    it('addNavigation()')
    it('addTableOfFigures()')
  })

  describe('Entire process', () => {
    // it('convert() should produce html', done => {
    //   converter.convert().then(html => {
    //     html.should.be.a('String')
    //     html.should.include('<div id="main"><p>some markdown!</p>\n</div>')
    //     done()
    //   }).catch(err => done(err))
    // })
  })
})
