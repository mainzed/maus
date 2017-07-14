import chai from 'chai'
import Converter from '../src/converter'
import chaiAsPromised from 'chai-as-promised'
import * as cheerio from 'cheerio'
import Definition from '../src/models/definition'

chai.use(chaiAsPromised)

let should = chai.should()

describe('Converter', () => {
  let converter = {}

  beforeEach(() => {
    converter = new Converter('jahresbericht', 'some markdown!')
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
    it('convertContent() should create valid html', done => {
      converter.markdown = 'This **markdown** contains metadata!'
      converter.convertContent().then(() => {
        converter.content('body').should.not.be.undefined
        converter.content('body').html().should.be.eql(`<p>This <strong>markdown</strong> contains metadata!</p>\n`)
        done()
      }).catch(err => done(err))
    })

    it('resolveLegacyStories()')
    it('convertContent() should resolve includes')

    it('getElements() should record definitions (with & w/o placeholders)', () => {
      const page = cheerio.load(`
        <div id="main">
          some markdown and a { definition: someDef }
          as well as a definition with { definition: someDef: somePlaceholder }
        </div>
      `)
      const result = converter.getElements(page)
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
      const page = cheerio.load(`
        <div id="main">
          some markdown and a { legacyDef }
          and with a placeholder { legacyDef: placeholder }
        </div>
      `)
      const result = converter.getElements(page)
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
      const page = cheerio.load(`
        <div id="main">
          some markdown and a { citation: cit1 }
        </div>
      `)
      const result = converter.getElements(page)
      result.should.be.a('array')
      result.length.should.be.eql(1)

      result[0].markdown.should.be.eql('{ citation: cit1 }')
      result[0].category.should.be.eql('citation')
      result[0].shortcut.should.be.eql('cit1')
    })

    it('getElements() should record stories', () => {
      const page = cheerio.load(`
        <div id="main">
          some markdown and a { story: story1 }
        </div>
      `)
      const result = converter.getElements(page)
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

      Definition.create({
        category: 'definition',
        word: 'def1',
        text: 'This is an example definition.',
        filetype: 'opMainzed'
      }, (err, definition) => {
        if (err) done(err)
        // after database element exists, try to find it
        converter.findDefinitionAndGetReplacement(element).then((result) => {
          result.should.have.property('element')
          result.should.have.property('replacement')

          result.replacement.should.be.eql(`
            <span id="${definition._id}" class="shortcut">
              def1
              <span class="definition">
                <span class="definition-title">def1</span>
                <span class="definition-text">This is an example definition.</span>
                <span class="definition-author">undefined</span>
                <span class="definition-website">undefined</span>
              </span>
            </span>
          `)
          done()
        }).catch(err => done(err))
      })
    })

    it('findCitationAndGetReplacement()')
    it('findStoryAndGetReplacement()')
    it('findIncludeAndGetReplacement()')
    it('getElement()')
    it('resolveElements()')
  })

  describe('fill template', () => {
    it('getTemplate() given should return string', done => {
      converter.recipe['template-path'] = 'templates/jahresbericht/main.html'
      converter.getTemplate().then(data => {
        data.should.be.a('string')
        done()
      }).catch(err => done(err))
    })

    it('fillTemplate() should create page with content')
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
})
