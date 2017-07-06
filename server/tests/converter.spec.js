import chai from 'chai'
import Converter from '../src/converter'
import chaiAsPromised from 'chai-as-promised'
import * as cheerio from 'cheerio'

chai.use(chaiAsPromised)

let should = chai.should()

describe('Converter', () => {
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

    converter.should.have.property('createGlossary')
    converter.createGlossary.should.be.a('function')
    // ...
  })

  it('should init new converter with given parameters', () => {
    const converter = new Converter('jahresbericht', 'some markdown!')
    converter.should.not.be.undefined
    converter.should.be.a('object')
    converter.type.should.equal('jahresbericht')
    converter.markdown.should.equal('some markdown!')
  })

  describe('Methods', () => {
    let converter = {}

    beforeEach(() => {
      converter = new Converter('jahresbericht', 'some markdown!')
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

    it('getPageFromTemplate() given template-path should return cheerio object', done => {
      converter.getRecipe(converter.type).then(recipe => {
        converter.getPageFromTemplate(recipe['template-path']).then(page => {
          page.should.not.be.undefined

          // TODO: proper tests for Cheerio objects
          page.should.have.property('html')
          page.html.should.be.a('function')
          done()
        })
      })
    })

    it('getTooltipFromTemplate()')
    it('insertContent()')
    it('getMetadata()')

    describe('Includes', () => {
      it('getIncludes()')
      it('resolveIncludes()')
    })

    describe('Elements', () => {

      beforeEach(done => {
        converter.getRecipe(converter.type).then(recipe => {
          converter.recipe = recipe
          done()
        }).catch((err) => done(err))
      })

      it('getElements() should record definitions (with & w/o placeholders)', () => {
        let page = cheerio.load(`
          <div id="read">
            some markdown and a { definition: someDef }
            as well as a definition with { definition: someDef: somePlaceholder }
          </div>
        `)
        let result = converter.getElements(page)
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
        let page = cheerio.load(`
          <div id="read">
            some markdown and a { legacyDef }
            and with a placeholder { legacyDef: placeholder }
          </div>
        `)
        let result = converter.getElements(page)
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
        let page = cheerio.load(`
          <div id="read">
            some markdown and a { citation: cit1 }
          </div>
        `)
        let result = converter.getElements(page)
        result.should.be.a('array')
        result.length.should.be.eql(1)

        result[0].markdown.should.be.eql('{ citation: cit1 }')
        result[0].category.should.be.eql('citation')
        result[0].shortcut.should.be.eql('cit1')
      })

      it('getElements() should record stories', () => {
        let page = cheerio.load(`
          <div id="read">
            some markdown and a { story: story1 }
          </div>
        `)
        let result = converter.getElements(page)
        result.should.be.a('array')
        result.length.should.be.eql(1)

        result[0].markdown.should.be.eql('{ story: story1 }')
        result[0].category.should.be.eql('story')
        result[0].shortcut.should.be.eql('story1')
      })

      it('findDefinitionAndGetReplacement()')
      it('findCitationAndGetReplacement()')
      it('findStoryAndGetReplacement()')
      it('findIncludeAndGetReplacement()')
      it('getElement()')
      it('resolveElements()')
    })

    describe('Sections', () => {
      it('createGlossary() given Cheerio should add glossary and return Cheerio object')
      it('createNavigation()')
      it('createTableOfFigures()')
    })
  })
})
